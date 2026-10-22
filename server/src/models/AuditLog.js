import mongoose, { Schema, model } from 'mongoose';

const auditLogSchema = new Schema(
  {
    action: {
      type: String,
      required: true
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    targetType: {
      type: String,
      default: ''
    },
    targetId: {
      type: String,
      default: ''
    },
    details: {
      type: Schema.Types.Mixed,
      default: {}
    },
    ipAddress: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

auditLogSchema.index({ createdAt: -1 });

export const AuditLog = model('AuditLog', auditLogSchema);
