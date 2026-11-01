import mongoose, { Schema, model } from 'mongoose';
import { TEACHING_MODES, REQUIREMENT_STATUSES } from '../config/constants.js';

const tuitionRequirementSchema = new Schema(
  {
    parent: {
      type: Schema.Types.ObjectId,
      ref: 'ParentProfile',
      required: true
    },
    parentUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    child: {
      type: Schema.Types.ObjectId,
      ref: 'ChildProfile',
      required: true
    },
    title: {
      type: String,
      trim: true,
      default: ''
    },
    classGrade: {
      type: String,
      required: [true, 'Class or Grade is required'],
      trim: true
    },
    board: {
      type: String,
      required: [true, 'Board is required'],
      trim: true
    },
    subjects: {
      type: [String],
      required: [true, 'At least one subject is required'],
      validate: [v => v.length > 0, 'At least one subject is required']
    },
    preferredLanguage: {
      type: String,
      default: 'English & Hindi'
    },
    learningGoals: {
      type: String,
      default: ''
    },
    teachingMode: {
      type: String,
      enum: Object.values(TEACHING_MODES),
      default: TEACHING_MODES.STUDENT_HOME
    },
    teachingModes: {
      type: [String],
      enum: Object.values(TEACHING_MODES),
      default: [TEACHING_MODES.STUDENT_HOME]
    },
    medium: {
      type: String,
      default: 'English'
    },
    specialNeeds: {
      type: String,
      default: ''
    },
    studentCount: {
      type: String,
      enum: ['individual', 'group'],
      default: 'individual'
    },
    schedule: {
      tuitionType: {
        type: String,
        enum: ['regular', 'short_term', 'one_time', 'crash_course'],
        default: 'regular'
      },
      preferredDays: {
        type: [String],
        default: ['Monday', 'Wednesday', 'Friday']
      },
      timeRanges: {
        type: [String],
        default: ['Evening (4 PM - 7 PM)']
      },
      specificTimeSlots: {
        type: [String],
        default: []
      },
      preferredStartDate: {
        type: Date,
        default: Date.now
      },
      classesPerWeek: {
        type: Number,
        default: 3,
        min: 1,
        max: 7
      },
      durationHours: {
        type: Number,
        default: 1.5,
        min: 0.5,
        max: 4
      }
    },
    budget: {
      minBudget: { type: Number, default: 400, min: 0 },
      maxBudget: { type: Number, default: 800, min: 0 },
      monthlyBudget: { type: Number, default: 0 },
      isFlexible: { type: Boolean, default: false },
      budgetType: {
        type: String,
        enum: ['hourly', 'per_class', 'monthly'],
        default: 'hourly'
      },
      groupTuitionOk: { type: Boolean, default: false }
    },
    location: {
      city: { type: String, default: 'Delhi' },
      locality: { type: String, default: 'Mayur Vihar Phase 1' },
      pincode: { type: String, default: '110091' },
      maxTravelDistanceKm: { type: Number, default: 5 }
    },
    tutorPreferences: {
      minExperienceYears: { type: Number, default: 1 },
      genderPreference: {
        type: String,
        enum: ['no_preference', 'female', 'male'],
        default: 'no_preference'
      },
      qualificationPreference: { type: String, default: 'Graduate' },
      additionalRequirements: { type: String, default: '' }
    },
    status: {
      type: String,
      enum: Object.values(REQUIREMENT_STATUSES),
      default: REQUIREMENT_STATUSES.ACTIVE
    }
  },
  {
    timestamps: true
  }
);

tuitionRequirementSchema.index({ classGrade: 1, teachingMode: 1, status: 1 });
tuitionRequirementSchema.index({ 'location.locality': 1 });

export const TuitionRequirement = model('TuitionRequirement', tuitionRequirementSchema);
