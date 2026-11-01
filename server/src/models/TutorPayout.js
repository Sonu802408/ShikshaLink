import mongoose, { Schema, model } from 'mongoose';
import { PAYOUT_STATUSES } from '../config/constants.js';

const tutorPayoutSchema = new Schema(
  {
    tutorUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    tutorProfile: {
      type: Schema.Types.ObjectId,
      ref: 'TutorProfile',
      required: true
    },
    booking: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: true
    },
    payment: {
      type: Schema.Types.ObjectId,
      ref: 'Payment',
      required: true
    },
    grossAmount: {
      type: Number,
      required: true,
      min: 0
    },
    platformCommission: {
      type: Number,
      default: 0,
      min: 0
    },
    commissionRatePercent: {
      type: Number,
      default: 10,
      min: 0
    },
    netPayableToTutor: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: Object.values(PAYOUT_STATUSES),
      default: PAYOUT_STATUSES.ACCRUED
    },
    payoutMethod: {
      type: String,
      enum: ['bank_transfer', 'upi'],
      default: 'upi'
    },
    tutorUpiOrAccount: {
      type: String,
      default: ''
    },
    transferReference: {
      type: String,
      default: '',
      trim: true
    },
    processedAt: {
      type: Date
    },
    processedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    adminNotes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

tutorPayoutSchema.index({ tutorUser: 1, status: 1 });
tutorPayoutSchema.index({ booking: 1 });
tutorPayoutSchema.index({ payment: 1 });

export const TutorPayout = model('TutorPayout', tutorPayoutSchema);
