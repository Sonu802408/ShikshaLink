import mongoose, { Schema, model } from 'mongoose';
import { TEACHING_MODES } from '../config/constants.js';

const batchSchema = new Schema({
  batchName: { type: String, required: true },
  classGrade: { type: String, required: true },
  subject: { type: String, required: true },
  capacity: { type: Number, default: 8 },
  enrolled: { type: Number, default: 0 },
  timing: { type: String, required: true },
  monthlyFee: { type: Number, default: 0 }
});

const availabilitySlotSchema = new Schema({
  startTime: { type: String, required: true }, // e.g. "16:00"
  endTime: { type: String, required: true },   // e.g. "17:30"
  isAvailable: { type: Boolean, default: true }
});

const dayAvailabilitySchema = new Schema({
  dayOfWeek: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true
  },
  slots: [availabilitySlotSchema]
});

const tutorProfileSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    headline: {
      type: String,
      default: 'Dedicated Academic Tutor',
      trim: true,
      maxlength: 120
    },
    bio: {
      type: String,
      default: '',
      trim: true
    },
    avatar: {
      type: String,
      default: '',
      trim: true
    },
    applicationId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true
    },
    applicationStatus: {
      type: String,
      enum: ['draft', 'applied', 'pending_review', 'approved', 'withdrawn', 'inactive', 'rejected'],
      default: 'draft'
    },
    isInCart: {
      type: Boolean,
      default: true
    },
    withdrawnAt: {
      type: Date
    },
    withdrawnReason: {
      type: String,
      default: ''
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: {
      type: Date
    },
    adminNotes: {
      type: String,
      default: ''
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        changedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        changedAt: { type: Date, default: Date.now },
        reason: { type: String, default: '' }
      }
    ],
    profileStatus: {
      type: String,
      enum: ['draft', 'pending_review', 'published', 'rejected'],
      default: 'draft'
    },
    registrationStep: {
      type: Number,
      default: 1,
      min: 1,
      max: 9
    },
    termsAccepted: {
      type: Boolean,
      default: false
    },
    submittedAt: {
      type: Date
    },
    // Step 1: Personal Details
    fullName: {
      type: String,
      trim: true,
      default: ''
    },
    dateOfBirth: {
      type: String,
      default: ''
    },
    gender: {
      type: String,
      enum: ['', 'Male', 'Female', 'Other', 'Prefer not to say'],
      default: ''
    },
    whatsappNumber: {
      type: String,
      default: ''
    },
    pincode: {
      type: String,
      default: ''
    },
    area: {
      type: String,
      default: ''
    },
    fullAddressPrivate: {
      type: String,
      default: '' // Strictly private; never exposed publicly
    },
    // Step 2: Education & Qualifications
    highestQualification: {
      type: String,
      default: ''
    },
    degreeCourseName: {
      type: String,
      default: ''
    },
    collegeUniversity: {
      type: String,
      default: ''
    },
    passingYear: {
      type: Number
    },
    expectedGraduationYear: {
      type: Number
    },
    additionalCertifications: {
      type: String,
      default: ''
    },
    qualificationsList: [
      {
        degree: { type: String, required: true },
        institution: { type: String, required: true },
        fieldOfStudy: { type: String, default: '' },
        passingYear: { type: Number },
        gradeOrPercentage: { type: String, default: '' },
        documentPath: { type: String, default: '' },
        documentOriginalName: { type: String, default: '' },
        documentMimeType: { type: String, default: '' },
        verificationStatus: {
          type: String,
          enum: ['pending', 'verified', 'rejected'],
          default: 'pending'
        },
        adminNotes: { type: String, default: '' }
      }
    ],
    // Step 3: Teaching Experience
    experienceYears: {
      type: Number,
      default: 0,
      min: 0
    },
    experienceMonths: {
      type: Number,
      default: 0,
      min: 0,
      max: 11
    },
    teachingInstitutions: {
      type: String,
      default: ''
    },
    classesPreviouslyTaught: {
      type: [String],
      default: []
    },
    subjectsPreviouslyTaught: {
      type: [String],
      default: []
    },
    experienceDescription: {
      type: String,
      default: ''
    },
    resumeDocument: {
      path: { type: String, default: '' },
      originalName: { type: String, default: '' },
      mimeType: { type: String, default: '' },
      uploadedAt: { type: Date }
    },
    // Step 4: Classes & Subjects
    schoolClassGroups: {
      type: [String],
      default: []
    },
    customSubjects: {
      type: [String],
      default: []
    },
    additionalTeachingCategories: {
      type: [String],
      default: []
    },
    // Step 5: Teaching Preferences
    teachingModePreferences: {
      type: [String],
      default: []
    },
    preferredStudentLevels: {
      type: [String],
      default: []
    },
    preferredTeachingAreas: {
      type: [String],
      default: []
    },
    preferredBatchSize: {
      type: String,
      default: 'One-to-One Tuition'
    },
    onlineOfflinePreference: {
      type: String,
      default: 'Both Online and Offline'
    },
    availableDays: {
      type: [String],
      default: []
    },
    availableTimeSlots: {
      type: [String],
      default: []
    },
    // Step 6: Fees & Availability
    hourlyFee: {
      type: Number,
      default: 500,
      min: 0
    },
    monthlyFee: {
      type: Number,
      default: 0,
      min: 0
    },
    trialClassAvailable: {
      type: Boolean,
      default: true
    },
    trialClassFee: {
      type: Number,
      default: 0
    },
    weeklyAvailability: {
      type: String,
      default: ''
    },
    preferredPaymentMethods: {
      type: [String],
      default: ['UPI', 'Bank Transfer', 'Cash']
    },
    // Step 7: About the Tutor
    strengthsAndSpecializations: {
      type: String,
      default: ''
    },
    achievements: {
      type: String,
      default: ''
    },
    awardsCertifications: {
      type: String,
      default: ''
    },
    // Step 8: Documents and Verification
    verificationDocuments: [
      {
        docType: {
          type: String,
          enum: ['identity', 'qualification', 'resume', 'other'],
          required: true
        },
        title: { type: String, default: '' },
        path: { type: String, required: true },
        originalName: { type: String, default: '' },
        mimeType: { type: String, default: '' },
        fileData: { type: String, select: false },
        status: {
          type: String,
          enum: ['pending', 'verified', 'rejected', 'needs_reupload'],
          default: 'pending'
        },
        adminNotes: { type: String, default: '' },
        uploadedAt: { type: Date, default: Date.now }
      }
    ],
    teachingModes: {
      type: [String],
      enum: Object.values(TEACHING_MODES),
      default: [TEACHING_MODES.ONLINE]
    },
    subjects: {
      type: [String],
      default: []
    },
    classes: {
      type: [String],
      default: []
    },
    boards: {
      type: [String],
      default: ['CBSE']
    },
    yearsOfExperience: {
      type: Number,
      default: 1,
      min: 0
    },
    previousExperience: {
      type: String,
      default: ''
    },
    teachingLanguages: {
      type: [String],
      default: ['English', 'Hindi']
    },
    teachingMethodology: {
      type: String,
      default: 'Concept-clarity first with regular practice tests, customized pace, and doubt clearing sessions.'
    },
    specialSkills: {
      type: String,
      default: ''
    },
    demoClassAvailable: {
      type: Boolean,
      default: true
    },
    demoClassFee: {
      type: Number,
      default: 0 // 0 = Free Demo Class
    },
    feeStructure: {
      pricingModel: {
        type: String,
        enum: ['hourly', 'per_class', 'monthly', 'custom'],
        default: 'hourly'
      },
      hourlyRate: { type: Number, default: 500, min: 0 },
      perClassRate: { type: Number, default: 600, min: 0 },
      monthlyRate: { type: Number, default: 4500, min: 0 },
      groupTuitionDiscountPercent: { type: Number, default: 20, min: 0, max: 100 },
      customPricingNotes: { type: String, default: '' }
    },
    homeTuitionDetails: {
      enabled: { type: Boolean, default: false },
      preferredLocalities: { type: [String], default: ['Mayur Vihar Phase 1'] },
      maxTravelDistanceKm: { type: Number, default: 5 },
      additionalTravelCharge: { type: Number, default: 0 }
    },
    centreDetails: {
      enabled: { type: Boolean, default: false },
      centreName: { type: String, default: '', trim: true },
      locality: { type: String, default: '', trim: true },
      fullAddress: { type: String, default: '', trim: true }, // Private until confirmed
      facilities: { type: [String], default: [] },
      batches: [batchSchema],
      directions: { type: String, default: '' } // Private until confirmed
    },
    availability: [dayAvailabilitySchema],
    verificationBadges: {
      accountVerified: { type: Boolean, default: true },
      idDocumentVerified: { type: Boolean, default: false },
      qualificationVerified: { type: Boolean, default: false },
      backgroundChecked: { type: Boolean, default: false }
    },
    isPublished: {
      type: Boolean,
      default: true
    },
    isAcceptingStudents: {
      type: Boolean,
      default: true
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0
    },
    teachingQualityScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    punctualityScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    communicationScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    isPinned: {
      type: Boolean,
      default: false
    },
    professionalTitle: {
      type: String,
      default: '',
      trim: true
    },
    shortIntro: {
      type: String,
      default: '',
      trim: true
    },
    qualificationDisplay: {
      type: String,
      default: '',
      trim: true
    },
    organisation: {
      name: { type: String, default: '' },
      role: { type: String, default: '' },
      foundedYear: { type: Number },
      description: { type: String, default: '' }
    },
    educationDetails: {
      degree: { type: String, default: '' },
      institution: { type: String, default: '' },
      campus: { type: String, default: '' },
      status: { type: String, default: '' },
      expectedGraduationYear: { type: Number }
    },
    programmingSkills: {
      type: [String],
      default: []
    },
    teachingMethodologyList: {
      type: [String],
      default: []
    },
    classSubjectMapping: [
      {
        classGroup: { type: String, required: true },
        subjects: [{ type: String }]
      }
    ],
    serviceArea: {
      locality: { type: String, default: '' },
      city: { type: String, default: '' },
      isConfirmed: { type: Boolean, default: false }
    },
    experienceDetails: {
      personalTeachingStartDate: { type: Date },
      personalTeachingYears: { type: Number },
      subjectsTaught: { type: [String], default: [] },
      responsibilities: { type: String, default: '' }
    },
    city: {
      type: String,
      default: 'Delhi'
    },
    primaryLocality: {
      type: String,
      default: 'Mayur Vihar Phase 1'
    }
  },
  {
    timestamps: true
  }
);

tutorProfileSchema.pre('save', function (next) {
  if (!this.applicationId) {
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    this.applicationId = `SL-TUT-${randomSuffix}`;
  }
  if (this.applicationStatus === 'withdrawn' || this.applicationStatus === 'inactive') {
    this.isPublished = false;
    this.isAcceptingStudents = false;
    this.isInCart = false;
  }
  next();
});

// Indexes for high performance search & discovery
tutorProfileSchema.index({ isPinned: -1 });
tutorProfileSchema.index({ applicationStatus: 1 });
tutorProfileSchema.index({ isInCart: 1 });
tutorProfileSchema.index({ profileStatus: 1 });
tutorProfileSchema.index({ subjects: 1 });
tutorProfileSchema.index({ classes: 1 });
tutorProfileSchema.index({ teachingModes: 1 });
tutorProfileSchema.index({ primaryLocality: 1 });
tutorProfileSchema.index({ 'feeStructure.hourlyRate': 1 });
tutorProfileSchema.index({ averageRating: -1 });
tutorProfileSchema.index({ yearsOfExperience: -1 });

export const TutorProfile = model('TutorProfile', tutorProfileSchema);
