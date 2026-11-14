import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../src/server.js';
import { PlatformSettings } from '../src/models/PlatformSettings.js';
import { Payment } from '../src/models/Payment.js';
import { Booking } from '../src/models/Booking.js';
import { User } from '../src/models/User.js';
import { TutorProfile } from '../src/models/TutorProfile.js';
import { TEACHING_MODES, PAYMENT_STATUSES, BOOKING_STATUSES } from '../src/config/constants.js';

describe('Online Payments, Admin UPI/QR Settings, and Checkout Verification Tests', () => {
  let parentToken;
  let parentUserId;
  let tutorToken;
  let tutorProfileId;
  let tutorUserId;
  let adminToken;
  let childId;
  let bookingId;
  let createdOrderId;
  let createdPaymentId;

  before(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shikshalink');
    }

    // 1. Register Parent
    const parentEmail = `pay_parent_${Date.now()}@test.com`;
    const regParent = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Kavita Singh',
        email: parentEmail,
        phone: '+91 98700 11223',
        password: 'Password@123',
        role: 'parent',
        locality: 'Mayur Vihar Phase 1'
      });

    assert.equal(regParent.status, 201);
    parentToken = regParent.body.token;
    parentUserId = regParent.body.user.id;

    // Add a child for parent
    const childRes = await request(app)
      .post('/api/parents/children')
      .set('Authorization', `Bearer ${parentToken}`)
      .send({
        fullName: 'Rohit Singh',
        classGrade: 'Class 10',
        board: 'CBSE',
        subjects: ['Mathematics']
      });

    assert.equal(childRes.status, 201);
    childId = childRes.body.child._id;

    // 2. Register Tutor
    const tutorEmail = `pay_tutor_${Date.now()}@test.com`;
    const regTutor = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Vikram Joshi',
        email: tutorEmail,
        phone: '+91 98700 22334',
        password: 'Password@123',
        role: 'tutor',
        locality: 'Mayur Vihar Phase 2'
      });

    assert.equal(regTutor.status, 201);
    tutorToken = regTutor.body.token;
    tutorUserId = regTutor.body.user.id;
    tutorProfileId = regTutor.body.profile._id;

    // Publish Tutor Profile with hourly rate = 600
    await request(app)
      .post('/api/tutors/submit')
      .set('Authorization', `Bearer ${tutorToken}`)
      .send({
        fullName: 'Vikram Joshi',
        hourlyFee: 500,
        subjects: ['Mathematics'],
        teachingModes: [TEACHING_MODES.ONLINE],
        termsAccepted: true
      });

    // Mark tutor as approved and accepting students for test
    await TutorProfile.findByIdAndUpdate(tutorProfileId, {
      isPublished: true,
      isAcceptingStudents: true,
      applicationStatus: 'approved',
      teachingModes: [TEACHING_MODES.ONLINE]
    });

    // 3. Ensure and Login Admin
    let adminDoc = await User.findOne({ email: 'admin@shikshalink.in' });
    if (!adminDoc) {
      adminDoc = await User.create({
        name: 'ShikshaLink Admin',
        email: 'admin@shikshalink.in',
        phone: '+91 98100 00001',
        passwordHash: 'Admin@12345',
        role: 'admin',
        isEmailVerified: true,
        isPhoneVerified: true
      });
    } else {
      adminDoc.passwordHash = 'Admin@12345';
      await adminDoc.save();
    }

    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@shikshalink.in',
        password: 'Admin@12345'
      });

    assert.equal(adminLogin.status, 200);
    adminToken = adminLogin.body.token;

    // 4. Create a regular booking
    const bookingDate = new Date();
    bookingDate.setDate(bookingDate.getDate() + 3);

    const bookingRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${parentToken}`)
      .send({
        tutorProfileId,
        childId,
        teachingMode: TEACHING_MODES.ONLINE,
        bookingType: 'regular',
        subject: 'Mathematics',
        classGrade: 'Class 10',
        sessionDate: bookingDate.toISOString(),
        startTime: '17:00',
        endTime: '18:00'
      });

    assert.equal(bookingRes.status, 201);
    bookingId = bookingRes.body.booking._id;
  });

  after(async () => {
    // Keep connection for other suites
  });

  test('1. Admin Settings: Update UPI ID, Payee, and Platform Fee (Percentage)', async () => {
    const res = await request(app)
      .put('/api/payments/admin/settings')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        businessDisplayName: 'ShikshaLink Official Escrow',
        upiId: 'singhsonu883661@ybl',
        upiPayeeName: 'Sonu Kumar',
        platformFeeType: 'percentage',
        platformFeeValue: 10,
        isOnlinePaymentEnabled: true,
        isCashPaymentEnabled: false,
        paymentInstructions: 'Scan PhonePe QR and transfer exact amount'
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.paymentSettings.upiId, 'singhsonu883661@ybl');
    assert.equal(res.body.paymentSettings.upiPayeeName, 'Sonu Kumar');
    assert.equal(res.body.paymentSettings.isCashPaymentEnabled, false);
    assert.equal(res.body.paymentSettings.platformFeeType, 'percentage');
    assert.equal(res.body.paymentSettings.platformFeeValue, 10);
  });

  test('2. Public/Parent Checkout Summary: Transparent fee breakdown includes platform fee exactly once', async () => {
    const res = await request(app)
      .get(`/api/payments/checkout/${bookingId}`)
      .set('Authorization', `Bearer ${parentToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    const summary = res.body.summary;

    // Check tutor & booking summary
    assert.equal(summary.tutor.name, 'Vikram Joshi');
    assert.equal(summary.booking.subject, 'Mathematics');

    // baseTutorFee = 500 (default hourly rate)
    // platformFee = 10% of 500 = 50
    // taxes = 18% of 50 = 9
    // finalAmount = 500 + 50 + 9 = 559
    assert.equal(summary.breakdown.baseTutorFee, 500);
    assert.equal(summary.breakdown.platformFee, 50);
    assert.equal(summary.breakdown.taxes, 9);
    assert.equal(summary.breakdown.finalAmount, 559);

    // Verify platform fee is NOT added twice
    const manualSum = summary.breakdown.baseTutorFee + summary.breakdown.platformFee + summary.breakdown.taxes;
    assert.equal(summary.breakdown.finalAmount, manualSum);

    // Verify payment methods: Online is enabled, Cash is disabled with "Currently Unavailable"
    assert.equal(summary.paymentMethods.online.enabled, true);
    assert.equal(summary.paymentMethods.cash.enabled, false);
    assert.equal(summary.paymentMethods.cash.statusLabel, 'Currently Unavailable');

    // Verify merchant UPI details match admin configuration
    assert.equal(summary.upiDetails.vpa, 'singhsonu883661@ybl');
    assert.equal(summary.upiDetails.payeeName, 'Sonu Kumar');
  });

  test('3. Cash Payment Rejection: Parent cannot submit booking using disabled cash method', async () => {
    const res = await request(app)
      .post('/api/payments/create-order')
      .set('Authorization', `Bearer ${parentToken}`)
      .send({
        bookingId,
        paymentMethod: 'cash'
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.ok(res.body.message.includes('Cash payment is currently unavailable'));
  });

  test('4. Create Online Order: Creates order with stable orderId and dynamic UPI URI', async () => {
    const res = await request(app)
      .post('/api/payments/create-order')
      .set('Authorization', `Bearer ${parentToken}`)
      .send({
        bookingId,
        paymentMethod: 'online_upi'
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.order.orderId.startsWith('ORD_'));
    assert.equal(res.body.order.amount, 559);
    assert.equal(res.body.order.upiDetails.vpa, 'singhsonu883661@ybl');
    assert.ok(res.body.order.upiDetails.qrCodeData.includes('singhsonu883661%40ybl'));

    createdOrderId = res.body.order.orderId;
  });

  test('5. Submit Manual UPI Payment: Requires UTR and transitions status to pending_verification', async () => {
    // Missing UTR should fail
    const failRes = await request(app)
      .post('/api/payments/submit-manual-upi')
      .set('Authorization', `Bearer ${parentToken}`)
      .send({
        orderId: createdOrderId,
        transactionReference: ''
      });

    assert.equal(failRes.status, 400);
    assert.equal(failRes.body.success, false);

    // Valid dynamic UTR submission
    const dynamicUtr = `UTR_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

    const successRes = await request(app)
      .post('/api/payments/submit-manual-upi')
      .set('Authorization', `Bearer ${parentToken}`)
      .send({
        orderId: createdOrderId,
        transactionReference: dynamicUtr,
        parentSubmissionNotes: 'Paid via PhonePe app'
      });

    assert.equal(successRes.status, 200);
    assert.equal(successRes.body.success, true);
    assert.equal(successRes.body.payment.status, 'pending_verification');
    assert.equal(successRes.body.payment.transactionReference, dynamicUtr);

    // Booking fee status should be pending_verification, NOT confirmed yet
    assert.equal(successRes.body.booking.fee.paymentStatus, 'pending_verification');
    assert.notEqual(successRes.body.booking.status, 'confirmed');

    createdPaymentId = successRes.body.payment._id;
  });

  test('6. Duplicate Replay Protection: Same UTR cannot be submitted again on another order', async () => {
    // Fetch the payment from step 5 to get its dynamic UTR
    const pmt = await Payment.findById(createdPaymentId);
    const existingUtr = pmt.transactionReference;

    // Create another booking
    const bookingDate = new Date();
    bookingDate.setDate(bookingDate.getDate() + 4);

    const bookingRes2 = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${parentToken}`)
      .send({
        tutorProfileId,
        childId,
        teachingMode: TEACHING_MODES.ONLINE,
        bookingType: 'regular',
        subject: 'Mathematics',
        classGrade: 'Class 10',
        sessionDate: bookingDate.toISOString(),
        startTime: '18:00',
        endTime: '19:00'
      });

    const orderRes2 = await request(app)
      .post('/api/payments/create-order')
      .set('Authorization', `Bearer ${parentToken}`)
      .send({
        bookingId: bookingRes2.body.booking._id,
        paymentMethod: 'online_upi'
      });

    // Try submitting identical UTR
    const replayRes = await request(app)
      .post('/api/payments/submit-manual-upi')
      .set('Authorization', `Bearer ${parentToken}`)
      .send({
        orderId: orderRes2.body.order.orderId,
        transactionReference: existingUtr
      });

    assert.equal(replayRes.status, 400);
    assert.equal(replayRes.body.success, false);
    assert.ok(replayRes.body.message.includes('already been submitted for another booking'));
  });

  test('7. Admin Verification Queue: Admin inspects pending payment and approves it', async () => {
    // Non-admin cannot verify
    const nonAdminRes = await request(app)
      .post(`/api/payments/admin/verify-manual/${createdPaymentId}`)
      .set('Authorization', `Bearer ${parentToken}`)
      .send({ action: 'approve' });

    assert.equal(nonAdminRes.status, 403);

    // Admin approves payment
    const approveRes = await request(app)
      .post(`/api/payments/admin/verify-manual/${createdPaymentId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        action: 'approve',
        adminNotes: 'Verified in PhonePe merchant statement with matching amount'
      });

    assert.equal(approveRes.status, 200);
    assert.equal(approveRes.body.success, true);
    assert.equal(approveRes.body.payment.status, 'paid');
    assert.equal(approveRes.body.booking.status, 'confirmed');
    assert.equal(approveRes.body.booking.fee.paymentStatus, 'paid');
  });

  test('8. Admin Rejection Workflow: Rejection marks payment rejected and notifies parent', async () => {
    // Create and submit a 3rd order
    const bookingDate = new Date();
    bookingDate.setDate(bookingDate.getDate() + 5);

    const bookingRes3 = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${parentToken}`)
      .send({
        tutorProfileId,
        childId,
        teachingMode: TEACHING_MODES.ONLINE,
        bookingType: 'regular',
        subject: 'Mathematics',
        classGrade: 'Class 10',
        sessionDate: bookingDate.toISOString(),
        startTime: '14:00',
        endTime: '15:00'
      });

    const orderRes3 = await request(app)
      .post('/api/payments/create-order')
      .set('Authorization', `Bearer ${parentToken}`)
      .send({
        bookingId: bookingRes3.body.booking._id,
        paymentMethod: 'online_upi'
      });

    const submitRes3 = await request(app)
      .post('/api/payments/submit-manual-upi')
      .set('Authorization', `Bearer ${parentToken}`)
      .send({
        orderId: orderRes3.body.order.orderId,
        transactionReference: 'INVALID_REF_99999'
      });

    assert.equal(submitRes3.status, 200);
    const pmt3Id = submitRes3.body.payment._id;

    // Admin rejects
    const rejectRes = await request(app)
      .post(`/api/payments/admin/verify-manual/${pmt3Id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        action: 'reject',
        rejectionReason: 'UTR not found in merchant bank records'
      });

    assert.equal(rejectRes.status, 200);
    assert.equal(rejectRes.body.success, true);
    assert.equal(rejectRes.body.payment.status, 'rejected');
    assert.equal(rejectRes.body.booking.fee.paymentStatus, 'awaiting_payment');
  });

  test('9. Configurable Platform Fee: Switch to fixed amount and verify checkout calculation', async () => {
    // Set platform fee to fixed ₹50
    const updateFeeRes = await request(app)
      .put('/api/payments/admin/settings')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        platformFeeType: 'fixed',
        platformFeeValue: 50
      });

    assert.equal(updateFeeRes.status, 200);
    assert.equal(updateFeeRes.body.paymentSettings.platformFeeType, 'fixed');
    assert.equal(updateFeeRes.body.paymentSettings.platformFeeValue, 50);

    // Create a new booking
    const bookingDate = new Date();
    bookingDate.setDate(bookingDate.getDate() + 6);

    const bookingRes4 = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${parentToken}`)
      .send({
        tutorProfileId,
        childId,
        teachingMode: TEACHING_MODES.ONLINE,
        bookingType: 'regular',
        subject: 'Mathematics',
        classGrade: 'Class 10',
        sessionDate: bookingDate.toISOString(),
        startTime: '10:00',
        endTime: '11:00'
      });

    const summaryRes = await request(app)
      .get(`/api/payments/checkout/${bookingRes4.body.booking._id}`)
      .set('Authorization', `Bearer ${parentToken}`);

    assert.equal(summaryRes.status, 200);
    const b = summaryRes.body.summary.breakdown;
    // base = 500, fixed platform fee = 50, taxes (18% of 50) = 9
    // final = 500 + 50 + 9 = 559
    assert.equal(b.baseTutorFee, 500);
    assert.equal(b.platformFee, 50);
    assert.equal(b.platformFeeType, 'fixed');
    assert.equal(b.taxes, 9);
    assert.equal(b.finalAmount, 559);
  });

  test('10. Persistence & Cross-Device Access: Settings persist in database and public endpoint', async () => {
    const publicConfig = await request(app).get('/api/payments/config/public');
    assert.equal(publicConfig.status, 200);
    assert.equal(publicConfig.body.config.upiId, 'singhsonu883661@ybl');
    assert.equal(publicConfig.body.config.upiPayeeName, 'Sonu Kumar');
    assert.equal(publicConfig.body.config.isOnlinePaymentEnabled, true);
    assert.equal(publicConfig.body.config.isCashPaymentEnabled, false);
    assert.equal(publicConfig.body.config.platformFeeType, 'fixed');
    assert.equal(publicConfig.body.config.platformFeeValue, 50);
  });
});
