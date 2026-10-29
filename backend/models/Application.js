const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: true
    },
    coverLetter: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: ['Applied', 'Under Review', 'Shortlisted', 'Selected', 'Rejected', 'Withdrawn'],
      default: 'Applied'
    },
    appliedAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate applications for the same job by the same student
applicationSchema.index({ studentId: 1, jobId: 1 }, { unique: true });
applicationSchema.index({ jobId: 1, status: 1 });
applicationSchema.index({ studentId: 1 });

module.exports = mongoose.model('Application', applicationSchema);

