const path = require('path');
const fs = require('fs');
const Resume = require('../models/Resume');
const StudentProfile = require('../models/StudentProfile');
const Application = require('../models/Application');
const Job = require('../models/Job');

// @desc    Upload a new PDF resume
// @route   POST /api/resumes
// @access  Private (Student only)
exports.uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select a PDF file to upload.'
      });
    }

    const resume = await Resume.create({
      studentId: req.user._id,
      originalName: req.file.originalname,
      fileName: req.file.filename,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype
    });

    // Update profile defaultResumeId if not set yet
    const profile = await StudentProfile.findOne({ userId: req.user._id });
    if (profile && !profile.defaultResumeId) {
      profile.defaultResumeId = resume._id;
      await profile.save();
    }

    res.status(201).json({
      success: true,
      message: 'Resume uploaded successfully.',
      resume
    });
  } catch (error) {
    // If error occurs, remove the uploaded file
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error('Failed to cleanup file:', err);
      }
    }
    next(error);
  }
};

// @desc    Get all resumes uploaded by logged-in student
// @route   GET /api/resumes
// @access  Private (Student only)
exports.getMyResumes = async (req, res, next) => {
  try {
    const resumes = await Resume.find({ studentId: req.user._id }).sort({ uploadedAt: -1 });
    res.json({
      success: true,
      count: resumes.length,
      resumes
    });
  } catch (error) {
    next(error);
  }
};

// @desc    View/Download resume with strict role authorization
// @route   GET /api/resumes/:id/view or /api/resumes/:id/download
// @access  Private (Student owner, Employer who received application, or Admin)
exports.getResumeFile = async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume file record not found.'
      });
    }

    let isAuthorized = false;

    // 1. Student owns the resume
    if (resume.studentId.toString() === req.user._id.toString()) {
      isAuthorized = true;
    }
    // 2. Admin can access
    else if (req.user.role === 'admin') {
      isAuthorized = true;
    }
    // 3. Employer can access if an applicant submitted this resume to one of employer's jobs
    else if (req.user.role === 'employer') {
      const employerJobs = await Job.find({ employerId: req.user._id }).select('_id');
      const jobIds = employerJobs.map((j) => j._id);

      const hasApplication = await Application.findOne({
        jobId: { $in: jobIds },
        resumeId: resume._id
      });

      if (hasApplication) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not authorized to view this resume.'
      });
    }

    const filePath = path.resolve(resume.filePath);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Physical file not found on server.'
      });
    }

    const isDownload = req.query.download === 'true';
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `${isDownload ? 'attachment' : 'inline'}; filename="${encodeURIComponent(resume.originalName)}"`
    );

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a resume
// @route   DELETE /api/resumes/:id
// @access  Private (Student owner only)
exports.deleteResume = async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found.'
      });
    }

    if (resume.studentId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own resumes.'
      });
    }

    // Check if any active application is using this resume
    const activeApp = await Application.findOne({
      resumeId: resume._id,
      status: { $in: ['Applied', 'Under Review', 'Shortlisted'] }
    });

    if (activeApp) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete this resume because it is linked to an active job application.'
      });
    }

    // Delete file from disk
    const filePath = path.resolve(resume.filePath);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error('Failed to delete physical file:', err);
      }
    }

    await Resume.findByIdAndDelete(req.params.id);

    // If profile had this as defaultResumeId, unset it
    await StudentProfile.findOneAndUpdate(
      { userId: req.user._id, defaultResumeId: req.params.id },
      { $unset: { defaultResumeId: 1 } }
    );

    res.json({
      success: true,
      message: 'Resume deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

