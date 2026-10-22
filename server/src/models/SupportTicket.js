import mongoose, { Schema, model } from 'mongoose';

const supportTicketSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      required: true
    },
    booking: {
      type: Schema.Types.ObjectId,
      ref: 'Booking'
    },
    ticketType: {
      type: String,
      enum: ['complaint', 'replacement_request', 'cancellation_issue', 'billing_query', 'general'],
      default: 'complaint'
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed'],
      default: 'open'
    },
    adminNotes: {
      type: String,
      default: ''
    },
    resolution: {
      type: String,
      default: ''
    },
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

export const SupportTicket = model('SupportTicket', supportTicketSchema);
