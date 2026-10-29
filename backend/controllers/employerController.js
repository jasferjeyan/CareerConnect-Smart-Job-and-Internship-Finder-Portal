const Job = require('../models/Job');
const Application = require('../models/Application');
const Company = require('../models/Company');

// @desc    Get employer dashboard stats
// @route   GET /api/employer/stats
// @access  Private (Employer only)
exports.getEmployerStats = async (req, res, next) => {
  try {
    const employerId = req.user._id;

    const [jobs, company] = await Promise.all([
      Job.find({ employerId }).sort({ createdAt: -1 }),
      Company.findOne({ employerId })
    ]);

    const jobIds = jobs.map((j) => j._id);

    const [totalApplications, recentApplications] = await Promise.all([
      Application.countDocuments({ jobId: { $in: jobIds } }),
      Application.find({ jobId: { $in: jobIds } })
        .populate('studentId', 'name email')
        .populate('jobId', 'title')
        .sort({ appliedAt: -1 })
        .limit(5)
    ]);

    const activeJobs = jobs.filter((j) => j.status === 'Active').length;
    const closedJobs = jobs.filter((j) => j.status === 'Closed').length;

    res.json({
      success: true,
      stats: {
        totalJobs: jobs.length,
        activeJobs,
        closedJobs,
        totalApplicants: totalApplications,
        company: company || { companyName: req.user.name },
        recentJobs: jobs.slice(0, 5),
        recentApplications
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all jobs posted by logged-in employer with application counts
// @route   GET /api/employer/jobs
// @access  Private (Employer only)
exports.getMyJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ employerId: req.user._id }).sort({ createdAt: -1 });

    const jobIds = jobs.map((j) => j._id);

    // Aggregate application counts per job
    const appCounts = await Application.aggregate([
      { $match: { jobId: { $in: jobIds } } },
      { $group: { _id: '$jobId', count: { $sum: 1 } } }
    ]);

    const countMap = new Map(appCounts.map((a) => [a._id.toString(), a.count]));

    const enrichedJobs = jobs.map((job) => ({
      ...job.toObject(),
      applicantCount: countMap.get(job._id.toString()) || 0
    }));

    res.json({
      success: true,
      count: enrichedJobs.length,
      jobs: enrichedJobs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get company profile
// @route   GET /api/employer/company
// @access  Private (Employer only)
exports.getCompanyProfile = async (req, res, next) => {
  try {
    let company = await Company.findOne({ employerId: req.user._id });
    if (!company) {
      company = await Company.create({
        employerId: req.user._id,
        companyName: req.user.name
      });
    }

    res.json({
      success: true,
      company
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update company profile
// @route   PATCH /api/employer/company
// @access  Private (Employer only)
exports.updateCompanyProfile = async (req, res, next) => {
  try {
    const { companyName, description, website, location, industry, logoUrl } = req.body;

    const company = await Company.findOneAndUpdate(
      { employerId: req.user._id },
      {
        companyName: companyName || req.user.name,
        description: description || '',
        website: website || '',
        location: location || '',
        industry: industry || '',
        logoUrl: logoUrl || ''
      },
      { new: true, upsert: true }
    );

    // Also update companyName in all jobs created by this employer
    if (companyName) {
      await Job.updateMany({ employerId: req.user._id }, { companyName });
    }

    res.json({
      success: true,
      message: 'Company profile updated successfully.',
      company
    });
  } catch (error) {
    next(error);
  }
};

