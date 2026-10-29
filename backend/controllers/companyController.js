const Company = require('../models/Company');
const { validationResult } = require('express-validator');

// @desc    Get logged-in company's profile
// @route   GET /api/company/me
// @access  Private (Employer only)
exports.getProfile = async (req, res, next) => {
  try {
    const company = await Company.findOne({ employerId: req.user._id }).select('-__v');
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company profile not found.' });
    }
    res.json({ success: true, company });
  } catch (err) {
    next(err);
  }
};

// @desc    Update logged-in company's profile
// @route   PATCH /api/company/me
// @access  Private (Employer only)
exports.updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ['companyName', 'description', 'website', 'location', 'industry', 'logoUrl'];
    const updates = {};
    allowedFields.forEach(f => {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    });
    const company = await Company.findOneAndUpdate({ employerId: req.user._id }, updates, { new: true, upsert: false });
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company profile not found.' });
    }
    // Propagate name change to jobs if changed
    if (updates.companyName) {
      const Job = require('../models/Job');
      await Job.updateMany({ employerId: req.user._id }, { companyName: updates.companyName });
    }
    res.json({ success: true, company });
  } catch (err) {
    next(err);
  }
};

