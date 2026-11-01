import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../src/server.js';
import { User } from '../src/models/User.js';
import { TutorProfile } from '../src/models/TutorProfile.js';

describe('Tutor Multi-Step Registration and Profile Persistence Tests', () => {
  let tutorToken;
  let tutorUserId;
  let tutorProfileId;
  let parentToken;

  before(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shikshalink');
    }

    // Create a tutor user
    const tutorEmail = `tutor_reg_${Date.now()}@test.com`;
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Priya Sharma',
        email: tutorEmail,
        phone: '+91 98111 22334',
        password: 'Password@123',
        role: 'tutor',
        locality: 'Mayur Vihar Phase 1'
      });

    assert.equal(regRes.status, 201);
    tutorToken = regRes.body.token;
    tutorUserId = regRes.body.user.id;
    tutorProfileId = regRes.body.profile._id;

    // Create a parent user for privacy checking
    const parentEmail = `parent_test_${Date.now()}@test.com`;
    const parentRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test Parent Privacy',
        email: parentEmail,
        phone: '+91 98111 99887',
        password: 'Password@123',
        role: 'parent',
        locality: 'Mayur Vihar Phase 1'
      });
    parentToken = parentRes.body.token;
  });

  after(async () => {
    // Clean up created test records
    if (tutorUserId) {
      await User.findByIdAndDelete(tutorUserId);
      await TutorProfile.findByIdAndDelete(tutorProfileId);
    }
  });

  test('1. Initial tutor profile starts in draft status', async () => {
    const res = await request(app)
      .get('/api/tutors/profile/me')
      .set('Authorization', `Bearer ${tutorToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.profile);
    assert.equal(res.body.profile.profileStatus, 'draft');
    assert.equal(typeof res.body.profileCompletion, 'number');
  });

  test('2. Save draft on Step 1 & 2 without failing validation', async () => {
    const draftPayload = {
      registrationStep: 2,
      fullName: 'Priya Sharma, M.Sc.',
      dateOfBirth: '1995-04-12',
      gender: 'Female',
      whatsappNumber: '+91 98111 22334',
      pincode: '110091',
      area: 'Mayur Vihar Phase 1',
      city: 'Delhi',
      fullAddressPrivate: 'Flat 402, Pocket 1, Mayur Vihar Phase 1, Delhi',
      highestQualification: 'Post Graduate',
      degreeCourseName: 'M.Sc. Physics',
      collegeUniversity: 'Delhi University (DU)',
      passingYear: 2018
    };

    const res = await request(app)
      .put('/api/tutors/draft')
      .set('Authorization', `Bearer ${tutorToken}`)
      .send(draftPayload);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.profile.registrationStep, 2);
    assert.equal(res.body.profile.highestQualification, 'Post Graduate');
    assert.equal(res.body.profile.fullAddressPrivate, 'Flat 402, Pocket 1, Mayur Vihar Phase 1, Delhi');
    assert.equal(res.body.profile.profileStatus, 'draft');
  });

  test('3. Cross-device resume: Fetch profile on second session loads all saved draft fields', async () => {
    // Simulating login from phone / second device
    const res = await request(app)
      .get('/api/tutors/profile/me')
      .set('Authorization', `Bearer ${tutorToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.profile.registrationStep, 2);
    assert.equal(res.body.profile.degreeCourseName, 'M.Sc. Physics');
    assert.equal(res.body.profile.collegeUniversity, 'Delhi University (DU)');
    assert.equal(res.body.profile.fullAddressPrivate, 'Flat 402, Pocket 1, Mayur Vihar Phase 1, Delhi');
  });

  test('4. Draft does NOT appear in public search results', async () => {
    const searchRes = await request(app)
      .get('/api/tutors?locality=Mayur Vihar Phase 1');

    assert.equal(searchRes.status, 200);
    const found = searchRes.body.tutors.some((t) => t._id.toString() === tutorProfileId.toString());
    assert.equal(found, false, 'Draft profile should not appear in public search');
  });

  test('5. Submit fails if required fields or terms are missing', async () => {
    const incompleteRes = await request(app)
      .post('/api/tutors/submit')
      .set('Authorization', `Bearer ${tutorToken}`)
      .send({ termsAccepted: false });

    assert.equal(incompleteRes.status, 400);
    assert.equal(incompleteRes.body.success, false);
  });

  test('6. Complete and submit tutor profile publishes successfully', async () => {
    const fullProfile = {
      fullName: 'Priya Sharma',
      dateOfBirth: '1995-04-12',
      gender: 'Female',
      whatsappNumber: '+91 98111 22334',
      pincode: '110091',
      area: 'Mayur Vihar Phase 1',
      city: 'Delhi',
      fullAddressPrivate: 'Flat 402, Pocket 1, Mayur Vihar Phase 1, Delhi',
      highestQualification: 'Post Graduate',
      degreeCourseName: 'M.Sc. Physics',
      collegeUniversity: 'Delhi University',
      passingYear: 2018,
      experienceYears: 6,
      experienceMonths: 4,
      teachingInstitutions: 'Ahlcon International School',
      classesPreviouslyTaught: ['Class 9', 'Class 10', 'Class 11', 'Class 12'],
      subjectsPreviouslyTaught: ['Physics', 'Science'],
      experienceDescription: '6+ years coaching CBSE board students in conceptual physics and board exam preparation.',
      schoolClassGroups: ['Classes 9–10', 'Classes 11–12'],
      subjects: ['Physics', 'Science'],
      customSubjects: ['AP Physics'],
      teachingModePreferences: ["Student's Home", 'Online Classes'],
      preferredStudentLevels: ['Secondary', 'Senior Secondary'],
      hourlyFee: 700,
      monthlyFee: 5500,
      trialClassAvailable: true,
      trialClassFee: 0,
      weeklyAvailability: '15-20 hours',
      headline: 'M.Sc. Physics | 6+ Yrs Experience CBSE Class 9-12 Specialist',
      bio: 'Dedicated physics educator with proven track record of helping students secure 90%+ in board exams. Concept clarity with practical examples.',
      termsAccepted: true
    };

    const submitRes = await request(app)
      .post('/api/tutors/submit')
      .set('Authorization', `Bearer ${tutorToken}`)
      .send(fullProfile);

    assert.equal(submitRes.status, 200);
    assert.equal(submitRes.body.success, true);
    assert.equal(submitRes.body.profile.profileStatus, 'published');
    assert.equal(submitRes.body.profile.isPublished, true);
    assert.equal(submitRes.body.profile.yearsOfExperience, 6);
    assert.equal(submitRes.body.profile.feeStructure.hourlyRate, 700);
  });

  test('7. Published tutor profile appears in public search and filters', async () => {
    const searchRes = await request(app)
      .get('/api/tutors?subject=Physics');

    assert.equal(searchRes.status, 200);
    const found = searchRes.body.tutors.some((t) => t._id.toString() === tutorProfileId.toString());
    assert.equal(found, true, 'Published tutor must appear in public search');
  });

  test('8. Strict privacy: Full address and WhatsApp number are redacted in public API', async () => {
    const publicRes = await request(app)
      .get(`/api/tutors/${tutorProfileId}/public`);

    assert.equal(publicRes.status, 200);
    const tutor = publicRes.body.tutor;
    assert.equal(tutor.fullAddressPrivate, undefined, 'Private address must never be exposed');
    assert.equal(tutor.whatsappNumber, undefined, 'WhatsApp number must never be exposed');
    assert.equal(tutor.verificationDocuments, undefined, 'Verification documents must never be exposed');
  });

  test('9. Editing published profile updates the same record without duplicates', async () => {
    const editRes = await request(app)
      .put('/api/tutors/draft')
      .set('Authorization', `Bearer ${tutorToken}`)
      .send({
        hourlyFee: 750,
        experienceYears: 7
      });

    assert.equal(editRes.status, 200);
    assert.equal(editRes.body.profile._id.toString(), tutorProfileId.toString());

    // Verify record count is still exactly 1 for this user
    const count = await TutorProfile.countDocuments({ user: tutorUserId });
    assert.equal(count, 1, 'Should not create duplicate tutor profiles');
  });
});
