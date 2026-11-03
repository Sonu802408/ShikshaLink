import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User.js';
import { TutorProfile } from '../models/TutorProfile.js';
import { ROLES, TEACHING_MODES } from './constants.js';

dotenv.config();

export const seedSonuTutor = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shikshalink';
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoURI);
    console.log('[Seed Sonu] Connected to MongoDB');
  }

  const sonuEmail = 'sonu.tutor@example.com';
  let sonuUser = await User.findOne({ email: sonuEmail });

  const avatarUrl = '/uploads/public/avatar-sonu-kumar.jpg';

  if (!sonuUser) {
    sonuUser = await User.create({
      name: 'Sonu Kumar',
      email: sonuEmail,
      phone: '+91 81305 50381',
      passwordHash: 'Tutor@123',
      role: ROLES.TUTOR,
      avatar: avatarUrl,
      isEmailVerified: true,
      isPhoneVerified: true
    });
    console.log('[Seed Sonu] Created User Sonu Kumar');
  } else {
    sonuUser.name = 'Sonu Kumar';
    sonuUser.phone = '+91 81305 50381';
    sonuUser.avatar = avatarUrl;
    await sonuUser.save();
    console.log('[Seed Sonu] Updated User Sonu Kumar');
  }

  const profileData = {
    user: sonuUser._id,
    isPinned: true, // Guarantees appearing first in listings
    professionalTitle: 'Private Tutor | Computer Science Student',
    qualificationDisplay: 'B.Tech CSE (Pursuing, 2027)',
    headline: 'Private Tutor | Computer Science Student | Founder of Tech Karma Classes',
    shortIntro: 'Concept-focused teaching, regular practice, doubt-solving, and exam preparation.',
    bio: `I am Sonu Kumar, a B.Tech Computer Science and Engineering student at Delhi Skill and Entrepreneurship University (DSEU), Okhla-II Campus, with an expected graduation year of 2027. I founded Tech Karma Classes in 2023 and am involved in the education sector.\n\nMy teaching approach focuses on building strong fundamentals, explaining concepts clearly, resolving doubts, encouraging regular practice, and helping students prepare effectively for examinations.\n\nI aim to create a supportive learning environment where students can ask questions freely, strengthen their problem-solving abilities, and develop confidence in their studies.`,
    organisation: {
      name: 'Tech Karma Classes',
      role: 'Founder',
      foundedYear: 2023,
      description: 'Educational organisation founded in 2023 involved in the education sector.'
    },
    educationDetails: {
      degree: 'B.Tech in Computer Science and Engineering',
      institution: 'Delhi Skill and Entrepreneurship University (DSEU)',
      campus: 'Okhla-II Campus',
      status: 'Currently pursuing',
      expectedGraduationYear: 2027
    },
    teachingModes: [TEACHING_MODES.STUDENT_HOME, TEACHING_MODES.TUTOR_CENTRE],
    subjects: [
      'Mathematics',
      'Science',
      'Computer Science',
      'History',
      'Geography',
      'Political Science',
      'English'
    ],
    classes: [
      'Classes 1–5',
      'Classes 6–8',
      'Classes 9–10',
      'Classes 11–12',
      'College / Programming'
    ],
    boards: ['CBSE', 'ICSE', 'State Board'],
    programmingSkills: [
      'Python',
      'C++',
      'Java',
      'Web Development',
      'AI/ML Fundamentals'
    ],
    classSubjectMapping: [
      {
        classGroup: 'Classes 1–5',
        subjects: ['Mathematics', 'English']
      },
      {
        classGroup: 'Classes 6–8',
        subjects: [
          'Mathematics',
          'Science',
          'English',
          'Computer Science',
          'History',
          'Geography',
          'Political Science'
        ]
      },
      {
        classGroup: 'Classes 9–10',
        subjects: [
          'Mathematics',
          'Science',
          'English',
          'Computer Science',
          'History',
          'Geography',
          'Political Science'
        ]
      },
      {
        classGroup: 'Classes 11–12',
        subjects: [
          'History',
          'Geography',
          'Political Science',
          'Computer Science'
        ]
      },
      {
        classGroup: 'College / Programming',
        subjects: [
          'Python',
          'C',
          'C++',
          'Java',
          'JavaScript',
          'HTML and CSS',
          'Web Development',
          'React',
          'Node.js and Express.js',
          'MongoDB and basic SQL',
          'Data Structures and Algorithms',
          'Object-Oriented Programming',
          'DBMS',
          'Operating Systems',
          'Computer Networks',
          'AI/ML Fundamentals'
        ]
      }
    ],
    teachingMethodologyList: [
      'Concept-based learning',
      'Step-by-step explanations',
      'Practical examples',
      'Individual doubt-solving',
      'Regular practice and revision',
      'Syllabus-oriented examination preparation',
      'Coding exercises and logical problem-solving for programming learners'
    ],
    teachingMethodology: 'Concept-based learning with step-by-step explanations, practical examples, individual doubt-solving, regular practice and revision, and syllabus-oriented examination preparation.',
    teachingLanguages: ['English', 'Hindi', 'Sanskrit'],
    feeStructure: {
      pricingModel: 'hourly',
      hourlyRate: 1000,
      perClassRate: 1000,
      monthlyRate: 8000,
      groupTuitionDiscountPercent: 15
    },
    homeTuitionDetails: {
      enabled: true,
      preferredLocalities: ['Mayur Vihar Phase 1', 'Chilla Village', 'East Delhi'],
      maxTravelDistanceKm: 6,
      additionalTravelCharge: 0
    },
    centreDetails: {
      enabled: true,
      centreName: 'Tech Karma Classes',
      locality: 'Mayur Vihar Phase 1 / Chilla Village',
      fullAddress: '[Revealed upon confirmed booking]',
      facilities: ['Air Conditioned', 'Whiteboard', 'Computer Lab Support']
    },
    serviceArea: {
      locality: 'Mayur Vihar Phase 1 / Chilla Village',
      city: 'East Delhi',
      isConfirmed: true
    },
    primaryLocality: 'Mayur Vihar Phase 1 / Chilla Village',
    city: 'East Delhi',
    demoClassAvailable: true,
    demoClassFee: 0,
    yearsOfExperience: 1,
    experienceDetails: {
      personalTeachingYears: 1,
      subjectsTaught: ['Mathematics', 'Computer Science', 'Science'],
      responsibilities: 'Founder at Tech Karma Classes (founded 2023). Private tutoring focusing on concept clarity and programming fundamentals.'
    },
    previousExperience: 'Founder of Tech Karma Classes (founded 2023). Hands-on academic tutoring and programming mentorship.',
    verificationBadges: {
      accountVerified: true,
      idDocumentVerified: false,
      qualificationVerified: false,
      backgroundChecked: false
    },
    profileStatus: 'published',
    applicationStatus: 'approved',
    isPublished: true,
    isAcceptingStudents: true,
    averageRating: 0,
    reviewCount: 0
  };

  let profile = await TutorProfile.findOne({ user: sonuUser._id });
  if (profile) {
    Object.assign(profile, profileData);
    await profile.save();
    console.log('[Seed Sonu] Updated TutorProfile for Sonu Kumar. ID:', profile._id);
  } else {
    profile = await TutorProfile.create(profileData);
    console.log('[Seed Sonu] Created TutorProfile for Sonu Kumar. ID:', profile._id);
  }

  return { user: sonuUser, profile };
};

// If run directly via node
if (process.argv[1]?.includes('seedSonuTutor.js')) {
  seedSonuTutor().then(() => {
    console.log('[Seed Sonu] Finished successfully!');
    process.exit(0);
  }).catch(err => {
    console.error('[Seed Sonu] Error:', err);
    process.exit(1);
  });
}
