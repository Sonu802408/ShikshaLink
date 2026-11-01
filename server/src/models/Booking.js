import mongoose, { Schema, model } from 'mongoose';
import { BOOKING_STATUSES, TEACHING_MODES } from '../config/constants.js';

const statusHistorySchema = new Schema({
  status: { type: String, required: true },
  changedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  timestamp: { type: Date, default: Date.now },
  notes: { type: String, default: '' }
});

const bookingSchema = new Schema(
  {
    parentUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    parentProfile: {
      type: Schema.Types.ObjectId,
      ref: 'ParentProfile',
      required: true
    },
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
    child: {
      type: Schema.Types.ObjectId,
      ref: 'ChildProfile',
      required: true
    },
    requirement: {
      type: Schema.Types.ObjectId,
      ref: 'TuitionRequirement'
    },
    bookingType: {
      type: String,
      enum: ['demo', 'regular'],
      default: 'demo'
    },
    teachingMode: {
      type: String,
      enum: Object.values(TEACHING_MODES),
      required: true
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true
    },
    classGrade: {
      type: String,
      required: [true, 'Class is required'],
      trim: true
    },
    schedule: {
      sessionDate: {
        type: Date,
        required: true
      },
      startTime: {
        type: String, // "17:00"
        required: true
      },
      endTime: {
        type: String, // "18:00"
        required: true
      },
      daysOfWeek: [String],
      durationHours: {
        type: Number,
        default: 1
      }
    },
    fee: {
      agreedAmount: {
        type: Number,
        default: 0
      },
      baseAmount: {
        type: Number,
        default: 0
      },
      platformFee: {
        type: Number,
        default: 0
      },
      taxes: {
        type: Number,
        default: 0
      },
      travelCharge: {
        type: Number,
        default: 0
      },
      totalAmount: {
        type: Number,
        default: 0
      },
      pricingUnit: {
        type: String,
        enum: ['per_hour', 'per_class', 'per_month', 'free_demo'],
        default: 'per_hour'
      },
      isDemoFree: {
        type: Boolean,
        default: true
      },
      paymentStatus: {
        type: String,
        enum: ['not_applicable', 'pending', 'awaiting_payment', 'pending_verification', 'paid', 'refund_pending', 'refunded', 'recorded_direct_to_tutor'],
        default: 'not_applicable'
      },
      payment: {
        type: Schema.Types.ObjectId,
        ref: 'Payment'
      }
    },
    status: {
      type: String,
      enum: Object.values(BOOKING_STATUSES),
      default: BOOKING_STATUSES.PENDING
    },
    proposedAlternative: {
      sessionDate: Date,
      startTime: String,
      endTime: String,
      notes: String,
      proposedBy: { type: Schema.Types.ObjectId, ref: 'User' }
    },
    onlineDetails: {
      meetingLink: { type: String, default: '' },
      platform: { type: String, default: 'Google Meet / Zoom' },
      instructions: { type: String, default: 'Tutor will provide or confirm the class link before the scheduled session.' }
    },
    homeTuitionDetails: {
      studentLocality: { type: String, default: '' },
      studentExactAddress: { type: String, default: '' }, // Only revealed upon confirmation
      parentContactPhone: { type: String, default: '' }   // Only revealed upon confirmation
    },
    centreDetails: {
      centreName: { type: String, default: '' },
      centreLocality: { type: String, default: '' },
      centreAddress: { type: String, default: '' }, // Only revealed upon confirmation
      batchName: { type: String, default: '' },
      directions: { type: String, default: '' }
    },
    cancellationReason: {
      type: String,
      default: ''
    },
    cancelledBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    disputeDetails: {
      reason: { type: String, default: '' },
      filedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      filedAt: Date,
      resolvedAt: Date,
      resolutionNotes: { type: String, default: '' }
    },
    hasReview: {
      type: Boolean,
      default: false
    },
    statusHistory: [statusHistorySchema]
  },
  {
    timestamps: true
  }
);

// Indexes
bookingSchema.index({ tutorUser: 1, status: 1 });
bookingSchema.index({ parentUser: 1, status: 1 });
bookingSchema.index({ 'schedule.sessionDate': 1 });

export const Booking = model('Booking', bookingSchema);
