import mongoose, { Schema, model } from 'mongoose';

const savedTutorSchema = new Schema(
  {
    parentUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    tutorProfile: {
      type: Schema.Types.ObjectId,
      ref: 'TutorProfile',
      required: true
    }
  },
  {
    timestamps: true
  }
);

savedTutorSchema.index({ parentUser: 1, tutorProfile: 1 }, { unique: true });

export const SavedTutor = model('SavedTutor', savedTutorSchema);
