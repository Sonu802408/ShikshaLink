import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { User } from '../models/User.js';
import { ParentProfile } from '../models/ParentProfile.js';
import { ChildProfile } from '../models/ChildProfile.js';
import { TutorProfile } from '../models/TutorProfile.js';
import { TutorQualification } from '../models/TutorQualification.js';
import { TuitionRequirement } from '../models/TuitionRequirement.js';
import { Booking } from '../models/Booking.js';
import { Review } from '../models/Review.js';
import { PlatformSettings } from '../models/PlatformSettings.js';
import { ROLES, TEACHING_MODES, BOOKING_STATUSES, REQUIREMENT_STATUSES } from './constants.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedDatabase = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shikshalink';
    await mongoose.connect(mongoURI);
    console.log('[Seed] Connected to MongoDB');

    // Clear existing collections
    await Promise.all([
      User.deleteMany({}),
      ParentProfile.deleteMany({}),
      ChildProfile.deleteMany({}),
      TutorProfile.deleteMany({}),
      TutorQualification.deleteMany({}),
      TuitionRequirement.deleteMany({}),
      Booking.deleteMany({}),
      Review.deleteMany({}),
      PlatformSettings.deleteMany({})
    ]);
    console.log('[Seed] Cleared existing data');

    // 1. Platform Settings
    await PlatformSettings.create({
      singletonKey: 'global_settings',
      platformName: 'ShikshaLink',
      supportEmail: 'support@shikshalink.in',
      supportPhone: '+91 98100 12345'
    });

    // 2. Administrator
    const adminUser = await User.create({
      name: 'ShikshaLink Admin',
      email: 'admin@shikshalink.in',
      phone: '+91 98100 00001',
      passwordHash: 'Admin@12345',
      role: ROLES.ADMIN,
      isEmailVerified: true,
      isPhoneVerified: true
    });
    console.log('[Seed] Created Administrator: admin@shikshalink.in / Admin@12345');

    // 3. Parents and Children
    const parent1User = await User.create({
      name: 'Rajesh Sharma',
      email: 'rajesh.parent@example.com',
      phone: '+91 98111 22334',
      passwordHash: 'Parent@123',
      role: ROLES.PARENT,
      isEmailVerified: true,
      isPhoneVerified: true
    });

    const parent1Profile = await ParentProfile.create({
      user: parent1User._id,
      city: 'Delhi',
      locality: 'Mayur Vihar Phase 1',
      address: 'Flat 402, Pocket 1, Mayur Vihar Phase 1, Delhi',
      pincode: '110091'
    });

    const child1 = await ChildProfile.create({
      parent: parent1Profile._id,
      parentUser: parent1User._id,
      fullName: 'Aarav Sharma',
      classGrade: 'Class 10',
      board: 'CBSE',
      school: 'Ahlcon International School',
      subjects: ['Mathematics', 'Science'],
      preferredLanguage: 'English & Hindi',
      learningGoals: 'Needs strong conceptual clarity in Quadratic Equations, Trigonometry, and Physics numericals for Class 10 Board exams.'
    });

    const child2 = await ChildProfile.create({
      parent: parent1Profile._id,
      parentUser: parent1User._id,
      fullName: 'Ananya Sharma',
      classGrade: 'Class 7',
      board: 'CBSE',
      school: 'Ahlcon Public School',
      subjects: ['Mathematics', 'English'],
      preferredLanguage: 'English',
      learningGoals: 'Building regular study habit and mental arithmetic skills.'
    });

    const parent2User = await User.create({
      name: 'Sunita Mehra',
      email: 'sunita.parent@example.com',
      phone: '+91 98111 55667',
      passwordHash: 'Parent@123',
      role: ROLES.PARENT,
      isEmailVerified: true,
      isPhoneVerified: true
    });

    const parent2Profile = await ParentProfile.create({
      user: parent2User._id,
      city: 'Delhi',
      locality: 'Patparganj (IP Extension)',
      address: 'Plot 18, Maitri Apartments, IP Extension, Delhi',
      pincode: '110092'
    });

    const child3 = await ChildProfile.create({
      parent: parent2Profile._id,
      parentUser: parent2User._id,
      fullName: 'Rohan Mehra',
      classGrade: 'Class 12',
      board: 'CBSE',
      school: 'Bal Bhavan Public School',
      subjects: ['Physics', 'Chemistry', 'Mathematics'],
      preferredLanguage: 'English',
      learningGoals: 'Targeting 95%+ in CBSE Board exams and JEE Main preparation.'
    });

    // 4. Create dummy sample PDF / doc files in private storage for qualification verification
    const privateDir = path.join(__dirname, '../../uploads/private');
    if (!fs.existsSync(privateDir)) fs.mkdirSync(privateDir, { recursive: true });
    const sampleDocPath = path.join(privateDir, 'sample_degree.pdf');
    if (!fs.existsSync(sampleDocPath)) {
      fs.writeFileSync(sampleDocPath, '%PDF-1.4\n%ShikshaLink Verified Educational Document Sample\n');
    }

    // 5. Tutors
    // Tutor A: Online + Student's Home (Mathematics specialist)
    const tutorAUser = await User.create({
      name: 'Dr. Vikram Malhotra',
      email: 'vikram.tutor@example.com',
      phone: '+91 98222 11001',
      passwordHash: 'Tutor@123',
      role: ROLES.TUTOR,
      isEmailVerified: true,
      isPhoneVerified: true
    });

    const tutorAProfile = await TutorProfile.create({
      user: tutorAUser._id,
      headline: 'M.Sc., Ph.D. in Mathematics | 10+ Yrs CBSE & JEE Foundation Specialist',
      bio: 'Passionate Mathematics educator with over 10 years of experience mentoring students for CBSE Classes 9-12 and JEE Foundation. My pedagogy emphasizes conceptual visualization, step-by-step problem dissection, and continuous doubt clearance. Based in Mayur Vihar Phase 1.',
      teachingModes: [TEACHING_MODES.ONLINE, TEACHING_MODES.STUDENT_HOME],
      subjects: ['Mathematics', 'Physics'],
      classes: ['Class 9', 'Class 10', 'Class 11', 'Class 12', 'Competitive: Foundation'],
      boards: ['CBSE', 'ICSE', 'State Board'],
      yearsOfExperience: 11,
      previousExperience: 'Ex-Senior Faculty at FIITJEE and Ahlcon Public School guest tutor.',
      teachingLanguages: ['English', 'Hindi'],
      teachingMethodology: 'Rigorous step-by-step concept breakdown, custom formula revision sheets, weekly timed mock tests, and personalized pace.',
      demoClassAvailable: true,
      demoClassFee: 0, // Free Demo Class
      feeStructure: {
        pricingModel: 'hourly',
        hourlyRate: 650,
        perClassRate: 750,
        monthlyRate: 5500,
        groupTuitionDiscountPercent: 25
      },
      homeTuitionDetails: {
        enabled: true,
        preferredLocalities: ['Mayur Vihar Phase 1', 'Mayur Vihar Phase 2', 'Patparganj (IP Extension)', 'Pandav Nagar'],
        maxTravelDistanceKm: 6,
        additionalTravelCharge: 0
      },
      availability: [
        {
          dayOfWeek: 'Monday',
          slots: [
            { startTime: '16:00', endTime: '17:30', isAvailable: true },
            { startTime: '18:00', endTime: '19:30', isAvailable: true }
          ]
        },
        {
          dayOfWeek: 'Wednesday',
          slots: [
            { startTime: '16:00', endTime: '17:30', isAvailable: true },
            { startTime: '18:00', endTime: '19:30', isAvailable: true }
          ]
        },
        {
          dayOfWeek: 'Friday',
          slots: [
            { startTime: '16:00', endTime: '17:30', isAvailable: true },
            { startTime: '18:00', endTime: '19:30', isAvailable: true }
          ]
        },
        {
          dayOfWeek: 'Saturday',
          slots: [
            { startTime: '10:00', endTime: '11:30', isAvailable: true },
            { startTime: '15:00', endTime: '16:30', isAvailable: true }
          ]
        }
      ],
      verificationBadges: {
        accountVerified: true,
        idDocumentVerified: true,
        qualificationVerified: true,
        backgroundChecked: true
      },
      isPublished: true,
      isAcceptingStudents: true,
      averageRating: 4.9,
      reviewCount: 14,
      teachingQualityScore: 5.0,
      punctualityScore: 4.8,
      communicationScore: 4.9,
      city: 'Delhi',
      primaryLocality: 'Mayur Vihar Phase 1'
    });

    await TutorQualification.create({
      tutor: tutorAProfile._id,
      tutorUser: tutorAUser._id,
      degree: 'M.Sc. Mathematics',
      institution: 'St. Stephen\'s College, Delhi University',
      fieldOfStudy: 'Applied Mathematics',
      passingYear: 2014,
      documentPath: 'sample_degree.pdf',
      documentOriginalName: 'Vikram_Malhotra_MSc_Degree.pdf',
      verificationStatus: 'verified',
      verifiedAt: new Date(),
      verifiedBy: adminUser._id,
      adminNotes: 'Verified against university records.'
    });

    // Tutor B: Tutor's Centre + Student's Home (Science & Biology)
    const tutorBUser = await User.create({
      name: 'Pooja Aggarwal',
      email: 'pooja.tutor@example.com',
      phone: '+91 98222 22002',
      passwordHash: 'Tutor@123',
      role: ROLES.TUTOR,
      isEmailVerified: true,
      isPhoneVerified: true
    });

    const tutorBProfile = await TutorProfile.create({
      user: tutorBUser._id,
      headline: 'M.Sc. Biotechnology | Science & Biology Teacher with Centre at Mayur Vihar Phase 2',
      bio: 'Dedicated science educator specializing in Physics, Chemistry, and Biology for Classes 6-10, and senior Biology for NEET preparation. I operate a fully equipped, air-conditioned learning centre in Mayur Vihar Phase 2, with small interactive batches (max 8 students) and individual attention.',
      teachingModes: [TEACHING_MODES.TUTOR_CENTRE, TEACHING_MODES.STUDENT_HOME],
      subjects: ['Science', 'Biology', 'Chemistry'],
      classes: ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12', 'Competitive: NEET'],
      boards: ['CBSE', 'ICSE'],
      yearsOfExperience: 7,
      previousExperience: 'Former PGT Biology at DAV Public School, Shreshtha Vihar.',
      teachingLanguages: ['English', 'Hindi'],
      teachingMethodology: 'Visual diagrams, 3D animated models, mnemonic techniques for biology terms, and chapter-wise question banks.',
      demoClassAvailable: true,
      demoClassFee: 0,
      feeStructure: {
        pricingModel: 'monthly',
        hourlyRate: 500,
        perClassRate: 550,
        monthlyRate: 4000,
        groupTuitionDiscountPercent: 20
      },
      homeTuitionDetails: {
        enabled: true,
        preferredLocalities: ['Mayur Vihar Phase 2', 'Mayur Vihar Phase 1', 'Vinod Nagar', 'Patparganj'],
        maxTravelDistanceKm: 4,
        additionalTravelCharge: 0
      },
      centreDetails: {
        enabled: true,
        centreName: 'Pooja Science Study Circle',
        locality: 'Mayur Vihar Phase 2',
        fullAddress: 'Shop 14, Commercial Complex, Pocket B, Mayur Vihar Phase 2, Delhi - 110091',
        facilities: ['Air-Conditioned Classroom', 'Interactive Whiteboard', 'Microscope Demo Bench', 'Parent Waiting Lounge'],
        batches: [
          {
            batchName: 'Class 10 CBSE Science Champions',
            classGrade: 'Class 10',
            subject: 'Science',
            capacity: 8,
            enrolled: 5,
            timing: 'Mon/Wed/Fri 5:00 PM - 6:30 PM',
            monthlyFee: 3500
          },
          {
            batchName: 'Class 9 Science Fundamentals',
            classGrade: 'Class 9',
            subject: 'Science',
            capacity: 8,
            enrolled: 4,
            timing: 'Tue/Thu/Sat 5:00 PM - 6:30 PM',
            monthlyFee: 3200
          }
        ],
        directions: 'Near Pocket B Market, opposite State Bank of India ATM.'
      },
      availability: [
        {
          dayOfWeek: 'Tuesday',
          slots: [{ startTime: '16:00', endTime: '17:30', isAvailable: true }]
        },
        {
          dayOfWeek: 'Thursday',
          slots: [{ startTime: '16:00', endTime: '17:30', isAvailable: true }]
        },
        {
          dayOfWeek: 'Saturday',
          slots: [{ startTime: '16:00', endTime: '17:30', isAvailable: true }]
        }
      ],
      verificationBadges: {
        accountVerified: true,
        idDocumentVerified: true,
        qualificationVerified: true,
        backgroundChecked: false // Clearly distinct per requirement
      },
      isPublished: true,
      isAcceptingStudents: true,
      averageRating: 4.8,
      reviewCount: 9,
      teachingQualityScore: 4.9,
      punctualityScore: 4.9,
      communicationScore: 4.7,
      city: 'Delhi',
      primaryLocality: 'Mayur Vihar Phase 2'
    });

    await TutorQualification.create({
      tutor: tutorBProfile._id,
      tutorUser: tutorBUser._id,
      degree: 'M.Sc. Biotechnology',
      institution: 'Jamia Millia Islamia',
      fieldOfStudy: 'Life Sciences',
      passingYear: 2017,
      documentPath: 'sample_degree.pdf',
      documentOriginalName: 'Pooja_Aggarwal_MSc.pdf',
      verificationStatus: 'verified',
      verifiedAt: new Date(),
      verifiedBy: adminUser._id,
      adminNotes: 'Degree verified.'
    });

    // Tutor C: Online Specialist (Computer Science, Coding, Physics)
    const tutorCUser = await User.create({
      name: 'Amitabh Sen',
      email: 'amitabh.tutor@example.com',
      phone: '+91 98222 33003',
      passwordHash: 'Tutor@123',
      role: ROLES.TUTOR,
      isEmailVerified: true,
      isPhoneVerified: true
    });

    const tutorCProfile = await TutorProfile.create({
      user: tutorCUser._id,
      headline: 'B.Tech IIT Delhi | Computer Science, Python & Physics Online Tutor',
      bio: 'Software engineer and experienced online educator teaching Computer Science (Python/Java/SQL) and Physics for Classes 8-12 and CUET/JEE Foundation. High quality digital tablet whiteboard setups and recorded revisions.',
      teachingModes: [TEACHING_MODES.ONLINE],
      subjects: ['Computer Science / Coding', 'Physics', 'Mathematics'],
      classes: ['Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12', 'Competitive: CUET'],
      boards: ['CBSE', 'ICSE', 'IB', 'Cambridge (IGCSE)'],
      yearsOfExperience: 5,
      previousExperience: 'Ex-Educator on Unacademy and freelance mentor.',
      teachingLanguages: ['English'],
      teachingMethodology: 'Interactive live coding, practical projects, step-by-step problem sets, and shared GitHub repositories.',
      demoClassAvailable: true,
      demoClassFee: 0,
      feeStructure: {
        pricingModel: 'hourly',
        hourlyRate: 700,
        perClassRate: 700,
        monthlyRate: 5000,
        groupTuitionDiscountPercent: 15
      },
      availability: [
        {
          dayOfWeek: 'Monday',
          slots: [{ startTime: '19:00', endTime: '20:30', isAvailable: true }]
        },
        {
          dayOfWeek: 'Wednesday',
          slots: [{ startTime: '19:00', endTime: '20:30', isAvailable: true }]
        },
        {
          dayOfWeek: 'Saturday',
          slots: [{ startTime: '11:00', endTime: '12:30', isAvailable: true }]
        }
      ],
      verificationBadges: {
        accountVerified: true,
        idDocumentVerified: true,
        qualificationVerified: true,
        backgroundChecked: true
      },
      isPublished: true,
      isAcceptingStudents: true,
      averageRating: 5.0,
      reviewCount: 8,
      teachingQualityScore: 5.0,
      punctualityScore: 5.0,
      communicationScore: 5.0,
      city: 'Delhi',
      primaryLocality: 'Mayur Vihar Phase 1'
    });

    await TutorQualification.create({
      tutor: tutorCProfile._id,
      tutorUser: tutorCUser._id,
      degree: 'B.Tech in Computer Science',
      institution: 'Indian Institute of Technology (IIT) Delhi',
      fieldOfStudy: 'Computer Science & Engineering',
      passingYear: 2019,
      documentPath: 'sample_degree.pdf',
      documentOriginalName: 'Amitabh_Sen_IIT_Degree.pdf',
      verificationStatus: 'verified',
      verifiedAt: new Date(),
      verifiedBy: adminUser._id,
      adminNotes: 'IIT Delhi graduation verified.'
    });

    // Tutor D: Pending Verification Tutor (Demonstrating admin verification queue)
    const tutorDUser = await User.create({
      name: 'Sneha Verma',
      email: 'sneha.tutor@example.com',
      phone: '+91 98222 44004',
      passwordHash: 'Tutor@123',
      role: ROLES.TUTOR,
      isEmailVerified: true,
      isPhoneVerified: true
    });

    const tutorDProfile = await TutorProfile.create({
      user: tutorDUser._id,
      headline: 'M.Com, UGC-NET Qualified | Economics & Accountancy Specialist',
      bio: 'Commerce and Economics educator with 4 years teaching experience in East Delhi schools. Specialized in Class 11 and 12 CBSE Board preparations and CUET Commerce.',
      teachingModes: [TEACHING_MODES.ONLINE, TEACHING_MODES.STUDENT_HOME],
      subjects: ['Economics', 'Accountancy', 'Business Studies'],
      classes: ['Class 11', 'Class 12', 'Competitive: CUET'],
      boards: ['CBSE', 'ICSE'],
      yearsOfExperience: 4,
      teachingLanguages: ['English', 'Hindi'],
      demoClassAvailable: true,
      demoClassFee: 0,
      feeStructure: {
        pricingModel: 'hourly',
        hourlyRate: 550,
        perClassRate: 600,
        monthlyRate: 4500
      },
      homeTuitionDetails: {
        enabled: true,
        preferredLocalities: ['Preet Vihar', 'Laxmi Nagar', 'Nirman Vihar', 'Mayur Vihar Phase 1'],
        maxTravelDistanceKm: 7
      },
      verificationBadges: {
        accountVerified: true,
        idDocumentVerified: false,
        qualificationVerified: false, // Pending admin review
        backgroundChecked: false
      },
      isPublished: true,
      isAcceptingStudents: true,
      averageRating: 0,
      reviewCount: 0,
      city: 'Delhi',
      primaryLocality: 'Preet Vihar'
    });

    await TutorQualification.create({
      tutor: tutorDProfile._id,
      tutorUser: tutorDUser._id,
      degree: 'M.Com in Finance & Accounts',
      institution: 'Delhi School of Economics, Delhi University',
      fieldOfStudy: 'Commerce & Accounting',
      passingYear: 2021,
      documentPath: 'sample_degree.pdf',
      documentOriginalName: 'Sneha_Verma_MCom_Certificate.pdf',
      verificationStatus: 'pending' // Visible in Admin Queue!
    });

    // 6. Tuition Requirements
    const req1 = await TuitionRequirement.create({
      parent: parent1Profile._id,
      parentUser: parent1User._id,
      child: child1._id,
      title: 'Class 10 CBSE Maths & Science Home Tutor Needed in Mayur Vihar',
      classGrade: 'Class 10',
      board: 'CBSE',
      subjects: ['Mathematics', 'Science'],
      preferredLanguage: 'English & Hindi',
      learningGoals: 'Focused preparation for Class 10 Board exams with weekly mock tests.',
      teachingMode: TEACHING_MODES.STUDENT_HOME,
      schedule: {
        preferredDays: ['Monday', 'Wednesday', 'Friday'],
        timeRanges: ['Evening (5 PM - 7 PM)'],
        classesPerWeek: 3,
        durationHours: 1.5
      },
      budget: {
        minBudget: 500,
        maxBudget: 800,
        budgetType: 'hourly',
        groupTuitionOk: false
      },
      location: {
        city: 'Delhi',
        locality: 'Mayur Vihar Phase 1',
        pincode: '110091',
        maxTravelDistanceKm: 5
      },
      tutorPreferences: {
        minExperienceYears: 3,
        genderPreference: 'no_preference',
        qualificationPreference: 'Post Graduate / Master\'s',
        additionalRequirements: 'Punctual and patient teacher with experience in CBSE Class 10 boards.'
      },
      status: REQUIREMENT_STATUSES.ACTIVE
    });

    // 7. Seed Bookings showcasing the lifecycle
    // Booking 1: Completed Demo Booking with Review
    const sessionDatePast = new Date();
    sessionDatePast.setDate(sessionDatePast.getDate() - 5);

    const bookingCompleted = await Booking.create({
      parentUser: parent1User._id,
      parentProfile: parent1Profile._id,
      tutorUser: tutorAUser._id,
      tutorProfile: tutorAProfile._id,
      child: child1._id,
      bookingType: 'demo',
      teachingMode: TEACHING_MODES.STUDENT_HOME,
      subject: 'Mathematics',
      classGrade: 'Class 10',
      schedule: {
        sessionDate: sessionDatePast,
        startTime: '16:00',
        endTime: '17:30'
      },
      fee: {
        agreedAmount: 0,
        pricingUnit: 'free_demo',
        isDemoFree: true
      },
      status: BOOKING_STATUSES.COMPLETED,
      homeTuitionDetails: {
        studentLocality: 'Mayur Vihar Phase 1',
        studentExactAddress: 'Flat 402, Pocket 1, Mayur Vihar Phase 1, Delhi',
        parentContactPhone: '+91 98111 22334'
      },
      statusHistory: [
        { status: BOOKING_STATUSES.PENDING, changedBy: parent1User._id, notes: 'Demo requested.' },
        { status: BOOKING_STATUSES.CONFIRMED, changedBy: tutorAUser._id, notes: 'Tutor accepted demo.' },
        { status: BOOKING_STATUSES.COMPLETED, changedBy: tutorAUser._id, notes: 'Session completed successfully.' }
      ],
      hasReview: true
    });

    // Review on completed booking
    await Review.create({
      booking: bookingCompleted._id,
      parentUser: parent1User._id,
      tutorUser: tutorAUser._id,
      tutorProfile: tutorAProfile._id,
      child: child1._id,
      overallRating: 5,
      teachingQualityRating: 5,
      punctualityRating: 5,
      communicationRating: 5,
      feedbackText: 'Dr. Vikram is an exceptional Mathematics teacher! In just one demo session, he helped Aarav understand complex coordinate geometry concepts effortlessly. He was extremely punctual and polite. Highly recommended to any parent in Mayur Vihar.',
      isPublished: true,
      moderationStatus: 'approved',
      tutorReply: {
        text: 'Thank you Rajesh ji! Aarav is very attentive and grasps mathematical logic quickly. Looking forward to our regular sessions.',
        repliedAt: new Date()
      }
    });

    // Booking 2: Upcoming Confirmed Online Booking
    const sessionDateFuture = new Date();
    sessionDateFuture.setDate(sessionDateFuture.getDate() + 2);

    await Booking.create({
      parentUser: parent2User._id,
      parentProfile: parent2Profile._id,
      tutorUser: tutorCUser._id,
      tutorProfile: tutorCProfile._id,
      child: child3._id,
      bookingType: 'regular',
      teachingMode: TEACHING_MODES.ONLINE,
      subject: 'Physics',
      classGrade: 'Class 12',
      schedule: {
        sessionDate: sessionDateFuture,
        startTime: '19:00',
        endTime: '20:30'
      },
      fee: {
        agreedAmount: 700,
        pricingUnit: 'per_hour',
        isDemoFree: false
      },
      status: BOOKING_STATUSES.CONFIRMED,
      onlineDetails: {
        meetingLink: 'https://meet.google.com/abc-shiksha-xyz',
        platform: 'Google Meet',
        instructions: 'Please keep NCERT Physics Part 1 textbook and calculator ready.'
      },
      statusHistory: [
        { status: BOOKING_STATUSES.PENDING, changedBy: parent2User._id, notes: 'Booking requested.' },
        { status: BOOKING_STATUSES.CONFIRMED, changedBy: tutorCUser._id, notes: 'Confirmed with Google Meet link.' }
      ]
    });

    console.log('[Seed] Database seeded successfully with realistic Delhi NCR / Mayur Vihar data!');
    console.log('[Seed] Summary:');
    console.log('  - 1 Administrator: admin@shikshalink.in / Admin@12345');
    console.log('  - 2 Parents: rajesh.parent@example.com / Parent@123, sunita.parent@example.com / Parent@123');
    console.log('  - 4 Tutors (Online, Home, Centre, Pending Verification)');
    console.log('  - Tuition Requirements, Bookings, and Verified Reviews created.');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]:', err);
    process.exit(1);
  }
};

seedDatabase();
