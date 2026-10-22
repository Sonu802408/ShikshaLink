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
    teachingModes: {
      type: [String],
      enum: Object.values(TEACHING_MODES),
      default: [TEACHING_MODES.ONLINE],
      validate: [v => v.length > 0, 'At least one teaching mode must be selected']
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

// Indexes for high performance search & discovery
tutorProfileSchema.index({ subjects: 1 });
tutorProfileSchema.index({ classes: 1 });
tutorProfileSchema.index({ teachingModes: 1 });
tutorProfileSchema.index({ primaryLocality: 1 });
tutorProfileSchema.index({ 'feeStructure.hourlyRate': 1 });
tutorProfileSchema.index({ averageRating: -1 });
tutorProfileSchema.index({ yearsOfExperience: -1 });

export const TutorProfile = model('TutorProfile', tutorProfileSchema);
