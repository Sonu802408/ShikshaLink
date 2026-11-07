import mongoose, { Schema, model } from 'mongoose';

const childProfileSchema = new Schema(
  {
    parent: {
      type: Schema.Types.ObjectId,
      ref: 'ParentProfile',
      required: true
    },
    parentUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    fullName: {
      type: String,
      required: [true, 'Child full name is required'],
      trim: true
    },
    displayName: {
      type: String,
      trim: true
    },
    classGrade: {
      type: String,
      required: [true, 'Class or Grade is required'],
      trim: true
    },
    board: {
      type: String,
      required: [true, 'School board is required'],
      trim: true
    },
    medium: {
      type: String,
      default: 'English',
      trim: true
    },
    school: {
      type: String,
      trim: true,
      default: ''
    },
    subjects: {
      type: [String],
      default: []
    },
    preferredLanguage: {
      type: String,
      default: 'English'
    },
    learningGoals: {
      type: String,
      default: ''
    },
    specialNeedsOrNotes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Auto-derive a safe privacy-preserving display name if not provided
childProfileSchema.pre('save', function (next) {
  if (!this.displayName) {
    const parts = this.fullName.trim().split(/\s+/);
    if (parts.length > 1) {
      this.displayName = `${parts[0]} ${parts[parts.length - 1][0]}.`;
    } else {
      this.displayName = parts[0];
    }
  }
  next();
});

// Method for safe public exposure to tutors or listings
childProfileSchema.methods.toSafePublic = function () {
  return {
    _id: this._id,
    displayName: this.displayName || 'Student',
    classGrade: this.classGrade,
    board: this.board,
    medium: this.medium || this.preferredLanguage || 'English',
    school: this.school || '',
    subjects: this.subjects,
    preferredLanguage: this.preferredLanguage,
    learningGoals: this.learningGoals
  };
};

export const ChildProfile = model('ChildProfile', childProfileSchema);
