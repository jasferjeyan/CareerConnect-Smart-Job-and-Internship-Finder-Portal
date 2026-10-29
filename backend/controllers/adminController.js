const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const StudentProfile = require('../models/StudentProfile');
const Company = require('../models/Company');

// @desc    Get all companies for admin moderation
// @route   GET /api/admin/companies
// @access  Private (Admin only)
exports.getAllCompanies = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const filter = {};
    if (status && status !== 'All') {
      filter.status = status;
    }
    if (search && search.trim() !== '') {
      filter.$or = [
        { companyName: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
        { industry: { $regex: search.trim(), $options: 'i' } }
      ];
    }
    const companies = await Company.find(filter).populate('employerId', 'name email').sort({ createdAt: -1 });
    res.json({
      success: true,
      count: companies.length,
      companies
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update company status (approve/reject)
// @route   PATCH /api/admin/companies/:id/status
// @access  Private (Admin only)
exports.updateCompanyStatus = async (req, res, next) => {
  try {
    const { status } = req.body; // expected: 'approved' or 'rejected'
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found.' });
    }
    company.status = status;
    await company.save();
    res.json({ success: true, message: `Company status set to ${status}.`, company });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/admin/stats
// @access  Private (Admin only)
exports.getAdminStats = async (req, res, next) => {
  try {
    const [
      totalStudents,
      totalEmployers,
      totalJobs,
      activeJobs,
      totalApplications,
      recentUsers,
      recentJobs
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'employer' }),
      Job.countDocuments(),
      Job.countDocuments({ status: 'Active' }),
      Application.countDocuments(),
      User.find().select('-password').sort({ createdAt: -1 }).limit(6),
      Job.find().sort({ createdAt: -1 }).limit(6)
    ]);

    res.json({
      success: true,
      stats: {
        totalStudents,
        totalEmployers,
        totalJobs,
        activeJobs,
        totalApplications,
        recentUsers,
        recentJobs
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users with filtering
// @route   GET /api/admin/users
// @access  Private (Admin only)
exports.getAllUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;
    const filter = {};

    if (role && role !== 'All') {
      filter.role = role;
    }

    if (search && search.trim() !== '') {
      filter.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user active status (deactivate / reactivate)
// @route   PATCH /api/admin/users/:id/status
// @access  Private (Admin only)
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    // Do not allow deactivating the main admin or self
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own administrative account.'
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User account has been ${user.isActive ? 'activated' : 'deactivated'}.`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user account and cascade cleanup
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own administrative account.'
      });
    }

    if (user.role === 'employer') {
      const employerJobs = await Job.find({ employerId: user._id }).select('_id');
      const jobIds = employerJobs.map((j) => j._id);
      await Application.deleteMany({ jobId: { $in: jobIds } });
      await Job.deleteMany({ employerId: user._id });
      await Company.deleteOne({ employerId: user._id });
    } else if (user.role === 'student') {
      await Application.deleteMany({ studentId: user._id });
      await StudentProfile.deleteOne({ userId: user._id });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'User and all associated data have been deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all jobs for admin moderation
// @route   GET /api/admin/jobs
// @access  Private (Admin only)
exports.getAllJobsAdmin = async (req, res, next) => {
  try {
    const { status, category, search } = req.query;
    const filter = {};

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (search && search.trim() !== '') {
      filter.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { companyName: { $regex: search.trim(), $options: 'i' } },
        { location: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const jobs = await Job.find(filter)
      .populate('employerId', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: jobs.length,
      jobs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin delete / remove inappropriate job
// @route   DELETE /api/admin/jobs/:id
// @access  Private (Admin only)
exports.deleteJobAdmin = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job listing not found.'
      });
    }

    await Promise.all([
      Job.findByIdAndDelete(req.params.id),
      Application.deleteMany({ jobId: req.params.id })
    ]);

    res.json({
      success: true,
      message: 'Job listing and associated applications have been permanently removed by admin.'
    });
  } catch (error) {
    next(error);
  }
};

