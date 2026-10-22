import mongoose, { Schema, model } from 'mongoose';
import { DEFAULT_LOCALITIES, CLASSES, BOARDS, SUBJECTS } from '../config/constants.js';

const platformSettingsSchema = new Schema(
  {
    singletonKey: {
      type: String,
      default: 'global_settings',
      unique: true
    },
    platformName: {
      type: String,
      default: 'ShikshaLink'
    },
    supportEmail: {
      type: String,
      default: 'support@shikshalink.in'
    },
    supportPhone: {
      type: String,
      default: '+91 98765 43210'
    },
    supportedLocalities: {
      type: [String],
      default: DEFAULT_LOCALITIES
    },
    supportedClasses: {
      type: [String],
      default: CLASSES
    },
    supportedBoards: {
      type: [String],
      default: BOARDS
    },
    supportedSubjects: {
      type: [String],
      default: SUBJECTS
    },
    cancellationPolicyText: {
      type: String,
      default: 'Free demo classes can be rescheduled up to 4 hours prior. Home and centre tuition sessions can be rescheduled by mutual parent-tutor agreement.'
    },
    safetyPolicyText: {
      type: String,
      default: 'ShikshaLink verifies tutor qualifications and email/phone contacts. For home tuition, parents are advised to have an adult family member present.'
    },
    feeSettings: {
      parentBookingFee: { type: Number, default: 0 },
      isTrialFree: { type: Boolean, default: true }
    }
  },
  {
    timestamps: true
  }
);

export const PlatformSettings = model('PlatformSettings', platformSettingsSchema);
