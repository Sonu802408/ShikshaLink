import mongoose, { Schema, model } from 'mongoose';

const reviewSchema = new Schema(
  {
    booking: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true
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
    tutorProfile: {
      type: Schema.Types.ObjectId,
      ref: 'TutorProfile',
      required: true
    },
    child: {
      type: Schema.Types.ObjectId,
      ref: 'ChildProfile'
    },
    overallRating: {
      type: Number,
      required: [true, 'Overall rating is required'],
      min: 1,
      max: 5
    },
    teachingQualityRating: {
      type: Number,
      required: [true, 'Teaching quality rating is required'],
      min: 1,
      max: 5
    },
    punctualityRating: {
      type: Number,
      required: [true, 'Punctuality rating is required'],
      min: 1,
      max: 5
    },
    communicationRating: {
      type: Number,
      required: [true, 'Communication rating is required'],
      min: 1,
      max: 5
    },
    feedbackText: {
      type: String,
      required: [true, 'Feedback text is required'],
      trim: true,
      minlength: [10, 'Feedback must be at least 10 characters long']
    },
    isPublished: {
      type: Boolean,
      default: true
    },
    moderationStatus: {
      type: String,
      enum: ['approved', 'flagged', 'hidden'],
      default: 'approved'
    },
    moderationNote: {
      type: String,
      default: ''
    },
    tutorReply: {
      text: { type: String, default: '' },
      repliedAt: { type: Date }
    }
  },
  {
    timestamps: true
  }
);

reviewSchema.index({ tutorProfile: 1, isPublished: 1 });

export const Review = model('Review', reviewSchema);
