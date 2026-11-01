import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../src/server.js';
import { User } from '../src/models/User.js';
import { TutorProfile } from '../src/models/TutorProfile.js';

describe('Tutor Application Cart, Exit/Withdrawal, and Admin Management Tests', () => {
  let tutorToken;
  let tutorUserId;
  let tutorProfileId;
  let tutorAppId;
  let parentToken;
  let parentUserId;
  let adminToken;

  before(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shikshalink');
    }

    // 1. Create a Tutor User
    const tutorEmail = `cart_tutor_${Date.now()}@test.com`;
    const regTutor = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Sunil Verma',
        email: tutorEmail,
        phone: '+91 98222 33445',
        password: 'Password@123',
        role: 'tutor',
        locality: 'Patparganj (IP Extension)'
      });

    assert.equal(regTutor.status, 201);
    tutorToken = regTutor.body.token;
    tutorUserId = regTutor.body.user.id;
    tutorProfileId = regTutor.body.profile._id;
    tutorAppId = regTutor.body.profile.applicationId;

    // 2. Create a Parent User
    const parentEmail = `cart_parent_${Date.now()}@test.com`;
    const regParent = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Amitabh Parent',
        email: parentEmail,
        phone: '+91 98333 44556',
        password: 'Password@123',
        role: 'parent',
        locality: 'Mayur Vihar Phase 1'
      });

    assert.equal(regParent.status, 201);
    parentToken = regParent.body.token;
    parentUserId = regParent.body.user.id;

    // 3. Login as Admin
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@shikshalink.in',
        password: 'Admin@12345'
      });

    assert.equal(adminLogin.status, 200);
    adminToken = adminLogin.body.token;
  });

  after(async () => {
    if (tutorUserId) {
      await User.findByIdAndDelete(tutorUserId);
      await TutorProfile.findByIdAndDelete(tutorProfileId);
    }
    if (parentUserId) {
      await User.findByIdAndDelete(parentUserId);
    }
  });

  test('1. Tutor Cart: Fetches user active application with stable applicationId', async () => {
    const res = await request(app)
      .get('/api/tutors/cart')
      .set('Authorization', `Bearer ${tutorToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.hasApplication, true);
    assert.equal(res.body.isInCart, true);
    assert.ok(res.body.application.applicationId.startsWith('SL-TUT-'));
  });

  test('2. Tutor Exit / Withdraw Application removes from active cart and marks status withdrawn', async () => {
    const res = await request(app)
      .post('/api/tutors/cart/withdraw')
      .set('Authorization', `Bearer ${tutorToken}`)
      .send({ reason: 'Temporarily taking break from tutoring' });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.profile.applicationStatus, 'withdrawn');
    assert.equal(res.body.profile.isInCart, false);
    assert.equal(res.body.profile.isPublished, false);
    assert.equal(res.body.profile.isAcceptingStudents, false);

    // Verify user account was NOT deleted
    const user = await User.findById(tutorUserId);
    assert.ok(user, 'User account must remain active when application is withdrawn');
  });

  test('3. Withdrawn application does NOT appear in active tutor cart or public search', async () => {
    // Check cart
    const cartRes = await request(app)
      .get('/api/tutors/cart')
      .set('Authorization', `Bearer ${tutorToken}`);

    assert.equal(cartRes.status, 200);
    assert.equal(cartRes.body.isInCart, false, 'Withdrawn tutor should not be active in cart');

    // Check public search
    const searchRes = await request(app)
      .get('/api/tutors?locality=Patparganj');

    assert.equal(searchRes.status, 200);
    const found = searchRes.body.tutors.some((t) => t._id.toString() === tutorProfileId.toString());
    assert.equal(found, false, 'Withdrawn tutor must not appear in public search');
  });

  test('4. Tutor can reactivate saved application without duplicate record', async () => {
    const res = await request(app)
      .post('/api/tutors/cart/reactivate')
      .set('Authorization', `Bearer ${tutorToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.profile.isInCart, true);

    const count = await TutorProfile.countDocuments({ user: tutorUserId });
    assert.equal(count, 1, 'Reactivation must not create a duplicate tutor record');
  });

  test('5. Admin Management: Lists all tutor applications with search and filters', async () => {
    const res = await request(app)
      .get(`/api/admin/tutors?search=Sunil`)
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.tutors.length >= 1);
    const found = res.body.tutors.some((t) => t.applicationId === tutorAppId || t.user?.name === 'Sunil Verma');
    assert.equal(found, true);
  });

  test('6. Admin inspects full tutor application with audit details', async () => {
    const res = await request(app)
      .get(`/api/admin/tutors/${tutorProfileId}/full`)
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.tutor);
    assert.equal(res.body.tutor._id.toString(), tutorProfileId.toString());
  });

  test('7. Admin approves tutor application and activates public listing', async () => {
    const res = await request(app)
      .patch(`/api/admin/tutors/${tutorProfileId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'approved',
        adminNotes: 'Verified background credentials and phone'
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.tutor.applicationStatus, 'approved');
    assert.equal(res.body.tutor.isPublished, true);
    assert.equal(res.body.tutor.isAcceptingStudents, true);
  });

  test('8. Admin deactivates and reactivates tutor', async () => {
    // Deactivate
    const deactRes = await request(app)
      .patch(`/api/admin/tutors/${tutorProfileId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'inactive', reason: 'Requested leave of absence' });

    assert.equal(deactRes.status, 200);
    assert.equal(deactRes.body.tutor.applicationStatus, 'inactive');
    assert.equal(deactRes.body.tutor.isPublished, false);

    // Reactivate / Restore
    const reactRes = await request(app)
      .patch(`/api/admin/tutors/${tutorProfileId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'approved', reason: 'Returned from leave' });

    assert.equal(reactRes.status, 200);
    assert.equal(reactRes.body.tutor.applicationStatus, 'approved');
    assert.equal(reactRes.body.tutor.isPublished, true);
  });

  test('9. Admin Cart Toggle: Removes and restores tutor from active cart', async () => {
    const removeRes = await request(app)
      .patch(`/api/admin/tutors/${tutorProfileId}/cart-toggle`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isInCart: false });

    assert.equal(removeRes.status, 200);
    assert.equal(removeRes.body.tutor.isInCart, false);

    const restoreRes = await request(app)
      .patch(`/api/admin/tutors/${tutorProfileId}/cart-toggle`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isInCart: true });

    assert.equal(restoreRes.status, 200);
    assert.equal(restoreRes.body.tutor.isInCart, true);
  });

  test('10. Admin adds existing user as tutor without duplicates', async () => {
    const res = await request(app)
      .post('/api/admin/tutors/create-from-user')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        userId: parentUserId,
        headline: 'Parent Transitioned to Chemistry Tutor',
        subjects: ['Chemistry'],
        classes: ['Class 11', 'Class 12'],
        hourlyFee: 800,
        autoApprove: true
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.tutor.applicationStatus, 'approved');
    assert.equal(res.body.tutor.feeStructure.hourlyRate, 800);

    // Verify user role was upgraded
    const user = await User.findById(parentUserId);
    assert.equal(user.role, 'tutor');
  });

  test('11. Security: Non-admin cannot access admin management APIs', async () => {
    const res = await request(app)
      .get('/api/admin/tutors')
      .set('Authorization', `Bearer ${tutorToken}`);

    assert.equal(res.status, 403, 'Tutors must not be able to access admin endpoints');

    const parentRes = await request(app)
      .get('/api/admin/tutors')
      .set('Authorization', `Bearer ${parentToken}`);

    assert.equal(parentRes.status, 403, 'Parents must not be able to access admin endpoints');
  });

  test('12. Permanent Delete: Requires explicit confirmation and preserves user account', async () => {
    // Without confirmation
    const noConfirm = await request(app)
      .delete(`/api/admin/tutors/${tutorProfileId}/permanent`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ confirmDelete: false });

    assert.equal(noConfirm.status, 400);

    // With explicit confirmation
    const confirmRes = await request(app)
      .delete(`/api/admin/tutors/${tutorProfileId}/permanent`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ confirmDelete: true });

    assert.equal(confirmRes.status, 200);
    assert.equal(confirmRes.body.success, true);

    // Verify TutorProfile deleted
    const deletedProfile = await TutorProfile.findById(tutorProfileId);
    assert.equal(deletedProfile, null);

    // Verify User account still exists!
    const userAccount = await User.findById(tutorUserId);
    assert.ok(userAccount, 'User account must never be destroyed by deleting a tutor application');
  });
});
