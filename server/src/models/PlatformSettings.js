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
      commissionPercentage: { type: Number, default: 10 },
      isTrialFree: { type: Boolean, default: true }
    },
    paymentSettings: {
      businessDisplayName: {
        type: String,
        default: 'ShikshaLink Education'
      },
      upiId: {
        type: String,
        default: 'singhsonu883661@ybl'
      },
      upiPayeeName: {
        type: String,
        default: 'Sonu Kumar'
      },
      upiQrCodeUrl: {
        type: String,
        default: '/uploads/public/payments/phonepe-qr.png'
      },
      isOnlinePaymentEnabled: {
        type: Boolean,
        default: true
      },
      isCashPaymentEnabled: {
        type: Boolean,
        default: false
      },
      platformFeeType: {
        type: String,
        enum: ['fixed', 'percentage'],
        default: 'percentage'
      },
      platformFeeValue: {
        type: Number,
        default: 10
      },
      paymentInstructions: {
        type: String,
        default: '1. Scan the UPI QR Code with PhonePe, Google Pay, Paytm, or BHIM.\n2. Complete payment for the exact total amount.\n3. Enter the 12-digit UTR/UPI Reference Number below.\n4. Our administration verifies it promptly and confirms your booking.'
      },
      paymentVerificationMethod: {
        type: String,
        enum: ['manual_upi', 'gateway'],
        default: 'manual_upi'
      }
    }
  },
  {
    timestamps: true
  }
);

export const PlatformSettings = model('PlatformSettings', platformSettingsSchema);
