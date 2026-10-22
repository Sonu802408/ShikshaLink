import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../src/server.js';
import { User } from '../src/models/User.js';
import { ChildProfile } from '../src/models/ChildProfile.js';
import { TutorProfile } from '../src/models/TutorProfile.js';
import { Booking } from '../src/models/Booking.js';
import { BOOKING_STATUSES, TEACHING_MODES } from '../src/config/constants.js';

describe('ShikshaLink Backend Integration Tests', () => {
  let parentToken;
  let parentUserId;
  let otherParentToken;
  let tutorToken;
  let tutorUserId;
  let tutorProfileId;
  let adminToken;
  let childId;
  let bookingId;

  before(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shikshalink');
    }
  });

  after(async () => {
    await mongoose.disconnect();
  });

  test('1. Health check returns 200 OK', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'ok');
  });

  test('2. Parent registration and login works', async () => {
    const uniqueEmail = `testparent_${Date.now()}@test.com`;
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test Parent One',
        email: uniqueEmail,
        phone: '+91 9988776655',
        password: 'Password@123',
        role: 'parent',
        locality: 'Mayur Vihar Phase 1'
      });

    assert.equal(res.status, 201);
    assert.ok(res.body.token);
    assert.equal(res.body.user.role, 'parent');
    parentToken = res.body.token;
    parentUserId = res.body.user.id;

    // Login check
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: uniqueEmail, password: 'Password@123' });

    assert.equal(loginRes.status, 200);
    assert.ok(loginRes.body.token);
  });

  test('3. Role injection prevention: Cannot register as admin publicly', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Hacker Admin',
        email: `hacker_${Date.now()}@test.com`,
        phone: '+91 9000000000',
        password: 'Password@123',
        role: 'admin' // Attempting to escalate role
      });

    assert.equal(res.status, 201);
    // Role MUST default to parent, never admin
    assert.equal(res.body.user.role, 'parent');
  });

  test('4. Tutor registration and profile creation', async () => {
    const tutorEmail = `testtutor_${Date.now()}@test.com`;
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test Tutor Maths',
        email: tutorEmail,
        phone: '+91 9112233445',
        password: 'Password@123',
        role: 'tutor',
        locality: 'Mayur Vihar Phase 2'
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.user.role, 'tutor');
    tutorToken = res.body.token;
    tutorUserId = res.body.user.id;
    tutorProfileId = res.body.profile._id;

    // Configure tutor teaching modes and fees
    const updateRes = await request(app)
      .put('/api/tutors/profile/me')
      .set('Authorization', `Bearer ${tutorToken}`)
      .send({
        headline: 'Senior Mathematics Specialist',
        bio: 'Over 8 years experience in teaching CBSE Class 10 and 12 Maths.',
        teachingModes: [TEACHING_MODES.ONLINE, TEACHING_MODES.STUDENT_HOME],
        subjects: ['Mathematics'],
        classes: ['Class 10', 'Class 12'],
        feeStructure: {
          pricingModel: 'hourly',
          hourlyRate: 600
        },
        homeTuitionDetails: {
          enabled: true,
          preferredLocalities: ['Mayur Vihar Phase 1', 'Mayur Vihar Phase 2']
        }
      });

    assert.equal(updateRes.status, 200);
    assert.deepEqual(updateRes.body.profile.teachingModes, [TEACHING_MODES.ONLINE, TEACHING_MODES.STUDENT_HOME]);
    assert.equal(updateRes.body.profile.feeStructure.hourlyRate, 600);
  });

  test('5. Parent adds child and sensitive data protection', async () => {
    const res = await request(app)
      .post('/api/parents/children')
      .set('Authorization', `Bearer ${parentToken}`)
      .send({
        fullName: 'Kavya Sharma',
        classGrade: 'Class 10',
        board: 'CBSE',
        school: 'Mother\'s Global School (Confidential)',
        subjects: ['Mathematics'],
        learningGoals: 'Scoring 90%+ in board exam'
      });

    assert.equal(res.status, 201);
    childId = res.body.child._id;
    assert.equal(res.body.child.displayName, 'Kavya S.');
  });

  test('6. Parent data isolation: Other parents cannot access child profile', async () => {
    // Create other parent
    const otherRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Other Parent',
        email: `otherparent_${Date.now()}@test.com`,
        phone: '+91 9777777777',
        password: 'Password@123',
        role: 'parent'
      });
    otherParentToken = otherRes.body.token;

    // Attempt to access parent 1's child
    const unauthorizedRes = await request(app)
      .get(`/api/parents/children/${childId}`)
      .set('Authorization', `Bearer ${otherParentToken}`);

    assert.equal(unauthorizedRes.status, 403);
  });

  test('7. Parent creates tuition requirement', async () => {
    const res = await request(app)
      .post('/api/requirements')
      .set('Authorization', `Bearer ${parentToken}`)
      .send({
        childId,
        classGrade: 'Class 10',
        board: 'CBSE',
        subjects: ['Mathematics'],
        teachingMode: TEACHING_MODES.STUDENT_HOME,
        budget: {
          minBudget: 400,
          maxBudget: 700,
          budgetType: 'hourly'
        },
        location: {
          locality: 'Mayur Vihar Phase 1',
          city: 'Delhi'
        }
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.requirement.teachingMode, TEACHING_MODES.STUDENT_HOME);
    assert.ok(res.body.matchedCount >= 0);
  });

  test('8. Booking lifecycle: Parent sends request -> Tutor accepts -> Confirmed', async () => {
    const sessionDate = new Date();
    sessionDate.setDate(sessionDate.getDate() + 4);

    const bookingRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${parentToken}`)
      .send({
        tutorProfileId,
        childId,
        teachingMode: TEACHING_MODES.STUDENT_HOME,
        bookingType: 'demo',
        subject: 'Mathematics',
        classGrade: 'Class 10',
        sessionDate: sessionDate.toISOString(),
        startTime: '17:00',
        endTime: '18:00',
        studentExactAddress: 'Pocket 1, Flat 101, Mayur Vihar Phase 1'
      });

    assert.equal(bookingRes.status, 201);
    bookingId = bookingRes.body.booking._id;
    assert.equal(bookingRes.body.booking.status, BOOKING_STATUSES.PENDING);

    // Tutor accepts booking
    const acceptRes = await request(app)
      .patch(`/api/bookings/${bookingId}/accept`)
      .set('Authorization', `Bearer ${tutorToken}`);

    assert.equal(acceptRes.status, 200);
    assert.equal(acceptRes.body.booking.status, BOOKING_STATUSES.CONFIRMED);
  });

  test('9. Conflict prevention: Conflicting booking on overlapping slot is rejected', async () => {
    const sessionDate = new Date();
    sessionDate.setDate(sessionDate.getDate() + 4);

    // Same tutor and same child on overlapping time 17:30 - 18:30 (overlaps with 17:00-18:00)
    const conflictRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${parentToken}`)
      .send({
        tutorProfileId,
        childId,
        teachingMode: TEACHING_MODES.STUDENT_HOME,
        bookingType: 'regular',
        subject: 'Mathematics',
        classGrade: 'Class 10',
        sessionDate: sessionDate.toISOString(),
        startTime: '17:30',
        endTime: '18:30'
      });

    assert.equal(conflictRes.status, 409);
    assert.match(conflictRes.body.message, /conflict detected/i);
  });

  test('10. Review eligibility: Cannot review an uncompleted booking', async () => {
    const reviewRes = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${parentToken}`)
      .send({
        bookingId,
        overallRating: 5,
        teachingQualityRating: 5,
        punctualityRating: 5,
        communicationRating: 5,
        feedbackText: 'Great teaching session!'
      });

    // Booking is in confirmed status, not completed yet
    assert.equal(reviewRes.status, 400);
    assert.match(reviewRes.body.message, /only be submitted after a session is completed/i);
  });

  test('11. Complete booking and review submission', async () => {
    // Mark completed
    const completeRes = await request(app)
      .patch(`/api/bookings/${bookingId}/complete`)
      .set('Authorization', `Bearer ${tutorToken}`);

    assert.equal(completeRes.status, 200);

    // Now submit review
    const reviewRes = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${parentToken}`)
      .send({
        bookingId,
        overallRating: 5,
        teachingQualityRating: 5,
        punctualityRating: 5,
        communicationRating: 5,
        feedbackText: 'Outstanding teacher! Made mathematics concepts very clear and intuitive.'
      });

    assert.equal(reviewRes.status, 201);
    assert.equal(reviewRes.body.review.overallRating, 5);
  });

  test('12. Tutor search and filtering across teaching modes', async () => {
    const res = await request(app)
      .get('/api/tutors?teachingMode=student_home&subject=Mathematics');

    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.tutors));
    assert.ok(res.body.tutors.length >= 1);
  });

  test('13. Public settings config endpoint returns supported modes and Delhi localities', async () => {
    const res = await request(app).get('/api/settings/config');
    assert.equal(res.status, 200);
    assert.ok(res.body.config.localities.includes('Mayur Vihar Phase 1'));
    assert.ok(res.body.config.classes.includes('Class 10'));
    assert.ok(res.body.config.boards.includes('CBSE'));
  });
});
