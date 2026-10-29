const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    phone: {
      type: String,
      trim: true
    },
    college: {
      type: String,
      trim: true
    },
    degree: {
      type: String,
      trim: true
    },
    graduationYear: {
      type: Number
    },
    skills: {
      type: [String],
      default: []
    },
    educationDetails: {
      type: String,
      trim: true
    },
    portfolioUrl: {
      type: String,
      trim: true
    },
    githubUrl: {
      type: String,
      trim: true
    },
    linkedinUrl: {
      type: String,
      trim: true
    },
    defaultResumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume'
    }
  },
  {
    timestamps: true
  }
);

studentProfileSchema.index({ skills: 1 });

module.exports = mongoose.model('StudentProfile', studentProfileSchema);

