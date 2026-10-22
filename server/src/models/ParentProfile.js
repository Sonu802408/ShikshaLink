import mongoose, { Schema, model } from 'mongoose';

const parentProfileSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    city: {
      type: String,
      default: 'Delhi',
      trim: true
    },
    locality: {
      type: String,
      default: 'Mayur Vihar Phase 1',
      trim: true
    },
    address: {
      type: String,
      default: '',
      trim: true
    },
    pincode: {
      type: String,
      default: '110091',
      trim: true
    },
    preferredLanguage: {
      type: String,
      default: 'English & Hindi'
    },
    notificationPreferences: {
      email: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    }
  },
  {
    timestamps: true
  }
);

export const ParentProfile = model('ParentProfile', parentProfileSchema);
