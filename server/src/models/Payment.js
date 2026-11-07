import mongoose, { Schema, model } from 'mongoose';
import { PAYMENT_STATUSES } from '../config/constants.js';

const paymentSchema = new Schema(
  {
    booking: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: true
    },
    parentUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    tutorUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    orderId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    paymentId: {
      type: String,
      default: '',
      trim: true
    },
    transactionReference: {
      type: String,
      default: '',
      trim: true
    },
    receiptScreenshotUrl: {
      type: String,
      default: ''
    },
    parentSubmissionNotes: {
      type: String,
      default: ''
    },
    submittedAt: {
      type: Date
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: {
      type: Date
    },
    rejectionReason: {
      type: String,
      default: ''
    },
    adminNotes: {
      type: String,
      default: ''
    },
    paymentMethod: {
      type: String,
      enum: ['online_upi', 'cash', 'upi', 'upi_qr', 'upi_intent', 'card', 'netbanking', 'sandbox_simulated', 'gateway'],
      default: 'online_upi'
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'INR'
    },
    breakdown: {
      baseTutorFee: { type: Number, default: 0 },
      platformFee: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      taxes: { type: Number, default: 0 },
      travelCharge: { type: Number, default: 0 },
      finalAmount: { type: Number, default: 0 }
    },
    status: {
      type: String,
      enum: Object.values(PAYMENT_STATUSES),
      default: PAYMENT_STATUSES.CREATED
    },
    upiDetails: {
      vpa: { type: String, default: '8130550381@pthdfc' },
      payeeName: { type: String, default: 'ShikshaLink Education (Sonu Kumar)' },
      qrCodeData: { type: String, default: '' },
      qrCodeUrl: { type: String, default: '/uploads/public/payments/paytm-qr.png' },
      expiresAt: { type: Date }
    },
    gatewaySignature: {
      type: String,
      default: ''
    },
    gatewayResponse: {
      type: Schema.Types.Mixed,
      default: {}
    },
    idempotencyKey: {
      type: String,
      unique: true,
      sparse: true
    },
    refundDetails: {
      refundId: { type: String, default: '' },
      refundAmount: { type: Number, default: 0 },
      reason: { type: String, default: '' },
      status: { type: String, default: '' },
      refundedAt: { type: Date }
    },
    isSandbox: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

paymentSchema.index({ booking: 1, status: 1 });
paymentSchema.index({ parentUser: 1 });
paymentSchema.index({ tutorUser: 1 });

export const Payment = model('Payment', paymentSchema);
