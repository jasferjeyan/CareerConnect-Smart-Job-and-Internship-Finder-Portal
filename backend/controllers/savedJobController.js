const SavedJob = require('../models/SavedJob');
const Job = require('../models/Job');

// @desc    Get student's saved jobs
// @route   GET /api/saved-jobs
// @access  Private (Student only)
exports.getSavedJobs = async (req, res, next) => {
  try {
    const saved = await SavedJob.find({ studentId: req.user._id })
      .populate('jobId')
      .sort({ savedAt: -1 });

    // Filter out any where the job was deleted
    const validSaved = saved.filter((item) => item.jobId !== null);

    res.json({
      success: true,
      count: validSaved.length,
      savedJobs: validSaved
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Save a job
// @route   POST /api/saved-jobs/:jobId
// @access  Private (Student only)
exports.saveJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found.'
      });
    }

    const existing = await SavedJob.findOne({ studentId: req.user._id, jobId });
    if (existing) {
      return res.json({
        success: true,
        message: 'Job is already saved.',
        savedJob: existing
      });
    }

    const savedJob = await SavedJob.create({
      studentId: req.user._id,
      jobId
    });

    res.status(201).json({
      success: true,
      message: 'Job saved to your bookmarks.',
      savedJob
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove a saved job
// @route   DELETE /api/saved-jobs/:jobId
// @access  Private (Student only)
exports.removeSavedJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    await SavedJob.findOneAndDelete({
      studentId: req.user._id,
      jobId
    });

    res.json({
      success: true,
      message: 'Job removed from saved bookmarks.'
    });
  } catch (error) {
    next(error);
  }
};

