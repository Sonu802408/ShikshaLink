import mongoose, { Schema, model } from 'mongoose';

const tutorQualificationSchema = new Schema(
  {
    tutor: {
      type: Schema.Types.ObjectId,
      ref: 'TutorProfile',
      required: true
    },
    tutorUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    degree: {
      type: String,
      required: [true, 'Degree / Certification title is required'],
      trim: true
    },
    institution: {
      type: String,
      required: [true, 'Institution / University is required'],
      trim: true
    },
    fieldOfStudy: {
      type: String,
      default: '',
      trim: true
    },
    passingYear: {
      type: Number,
      required: [true, 'Passing year is required'],
      min: 1960,
      max: 2030
    },
    documentPath: {
      type: String,
      required: [true, 'Document proof is required'] // Private file path in uploads/private
    },
    documentOriginalName: {
      type: String,
      default: 'document.pdf'
    },
    documentMimeType: {
      type: String,
      default: 'application/pdf'
    },
    fileData: {
      type: String,
      select: false
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending'
    },
    adminNotes: {
      type: String,
      default: ''
    },
    verifiedAt: {
      type: Date
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

tutorQualificationSchema.index({ tutor: 1, verificationStatus: 1 });

export const TutorQualification = model('TutorQualification', tutorQualificationSchema);
