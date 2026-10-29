const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    employerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Company email is required'],
      lowercase: true,
      trim: true,
      unique: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    password: {
      // password will be stored in linked User document; keep field for reference only
      type: String,
      required: false
    },
    description: {
      type: String,
      trim: true
    },
    website: {
      type: String,
      trim: true
    },
    location: {
      type: String,
      trim: true
    },
    industry: {
      type: String,
      trim: true
    },
    logoUrl: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Company', companySchema);

