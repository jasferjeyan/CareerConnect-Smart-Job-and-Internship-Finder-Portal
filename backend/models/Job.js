const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    employerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company'
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true
    },
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Description is required']
    },
    responsibilities: {
      type: String,
      default: ''
    },
    requiredSkills: {
      type: [String],
      required: [true, 'At least one required skill must be specified'],
      default: []
    },
    qualifications: {
      type: String,
      default: ''
    },
    experienceLevel: {
      type: String,
      enum: ['Entry Level', 'Mid Level', 'Senior Level', 'Internship', 'Fresher', 'Any'],
      default: 'Fresher'
    },
    jobType: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Internship', 'Contract'],
      required: [true, 'Job type is required']
    },
    workplaceMode: {
      type: String,
      enum: ['Remote', 'Hybrid', 'Onsite'],
      default: 'Onsite'
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true
    },
    salary: {
      type: String,
      default: 'Not Disclosed'
    },
    deadline: {
      type: Date
    },
    status: {
      type: String,
      enum: ['Active', 'Closed', 'Draft'],
      default: 'Active'
    }
  },
  {
    timestamps: true
  }
);

// Search index for fast text search
jobSchema.index({
  title: 'text',
  companyName: 'text',
  description: 'text',
  location: 'text'
});

jobSchema.index({ category: 1, status: 1, jobType: 1 });
jobSchema.index({ employerId: 1 });

module.exports = mongoose.model('Job', jobSchema);

