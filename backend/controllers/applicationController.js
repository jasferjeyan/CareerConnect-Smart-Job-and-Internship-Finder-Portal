const Application = require('../models/Application');
const Job = require('../models/Job');
const Resume = require('../models/Resume');
const StudentProfile = require('../models/StudentProfile');

// @desc    Apply for a job or internship
// @route   POST /api/jobs/:id/apply
// @access  Private (Student only)
exports.applyForJob = async (req, res, next) => {
  try {
    const jobId = req.params.id;
    const { resumeId, coverLetter } = req.body;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job listing not found.'
      });
    }

    if (job.status !== 'Active') {
      return res.status(400).json({
        success: false,
        message: 'This job listing is no longer accepting applications.'
      });
    }

    // Check if resume is provided and belongs to the student
    if (!resumeId) {
      return res.status(400).json({
        success: false,
        message: 'Please select an uploaded resume to apply.'
      });
    }

    const resume = await Resume.findOne({ _id: resumeId, studentId: req.user._id });
    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Selected resume was not found in your account.'
      });
    }

    // Check if student already applied
    const existing = await Application.findOne({ studentId: req.user._id, jobId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `You have already applied for this position (Current status: ${existing.status}).`
      });
    }

    const application = await Application.create({
      studentId: req.user._id,
      jobId,
      resumeId: resume._id,
      coverLetter: coverLetter ? coverLetter.trim() : '',
      status: 'Applied'
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully!',
      application
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all applications submitted by logged-in student
// @route   GET /api/applications/me
// @access  Private (Student only)
exports.getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ studentId: req.user._id })
      .populate({
        path: 'jobId',
        select: 'title companyName location jobType workplaceMode salary status deadline category'
      })
      .populate({
        path: 'resumeId',
        select: 'originalName fileName fileSize uploadedAt'
      })
      .sort({ appliedAt: -1 });

    res.json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Withdraw an application
// @route   PATCH /api/applications/:id/withdraw
// @access  Private (Student only)
exports.withdrawApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.'
      });
    }

    if (application.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only withdraw your own applications.'
      });
    }

    if (['Withdrawn', 'Selected', 'Rejected'].includes(application.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot withdraw an application that is already '${application.status}'.`
      });
    }

    application.status = 'Withdrawn';
    application.updatedAt = new Date();
    await application.save();

    res.json({
      success: true,
      message: 'Application has been withdrawn successfully.',
      application
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get applicants for employer's posted jobs
// @route   GET /api/employer/applications
// @access  Private (Employer only)
exports.getEmployerApplications = async (req, res, next) => {
  try {
    const { jobId, status } = req.query;

    // Find all jobs posted by this employer
    const employerJobs = await Job.find({ employerId: req.user._id }).select('_id title');
    const jobIds = employerJobs.map((j) => j._id);

    if (jobIds.length === 0) {
      return res.json({
        success: true,
        count: 0,
        applications: []
      });
    }

    const filter = { jobId: { $in: jobIds } };

    if (jobId && jobIds.some((id) => id.toString() === jobId)) {
      filter.jobId = jobId;
    }

    if (status && status !== 'All') {
      filter.status = status;
    }

    const applications = await Application.find(filter)
      .populate('studentId', 'name email createdAt')
      .populate('jobId', 'title companyName location jobType requiredSkills')
      .populate('resumeId', 'originalName fileName fileSize uploadedAt')
      .sort({ appliedAt: -1 });

    // Fetch student profile details for each applicant
    const studentUserIds = applications.map((a) => a.studentId?._id).filter(Boolean);
    const profiles = await StudentProfile.find({ userId: { $in: studentUserIds } });
    const profileMap = new Map(profiles.map((p) => [p.userId.toString(), p]));

    const enriched = applications.map((app) => {
      const obj = app.toObject();
      const studentIdStr = app.studentId?._id?.toString();
      obj.studentProfile = profileMap.get(studentIdStr) || null;
      return obj;
    });

    res.json({
      success: true,
      count: enriched.length,
      applications: enriched
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update application status
// @route   PATCH /api/applications/:id/status
// @access  Private (Employer owner or Admin)
exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Applied', 'Under Review', 'Shortlisted', 'Selected', 'Rejected', 'Withdrawn'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${validStatuses.join(', ')}`
      });
    }

    const application = await Application.findById(req.params.id).populate('jobId');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.'
      });
    }

    // Role check: employer must own the job; admin can update any
    if (
      req.user.role !== 'admin' &&
      application.jobId.employerId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update applications for this job.'
      });
    }

    application.status = status;
    application.updatedAt = new Date();
    await application.save();

    res.json({
      success: true,
      message: `Application status updated to "${status}".`,
      application
    });
  } catch (error) {
    next(error);
  }
};

