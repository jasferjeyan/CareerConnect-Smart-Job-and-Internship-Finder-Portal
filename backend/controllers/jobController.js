const Job = require('../models/Job');
const Company = require('../models/Company');
const StudentProfile = require('../models/StudentProfile');
const Application = require('../models/Application');
const SavedJob = require('../models/SavedJob');

// Helper to calculate skill match
const calculateSkillMatch = (studentSkills, jobSkills) => {
  if (!studentSkills || studentSkills.length === 0 || !jobSkills || jobSkills.length === 0) {
    return {
      matchPercentage: 0,
      matchingSkills: [],
      missingSkills: jobSkills || []
    };
  }

  const normalizedStudentSkills = studentSkills.map((s) => s.trim().toLowerCase());
  const matchingSkills = [];
  const missingSkills = [];

  jobSkills.forEach((skill) => {
    const trimmedSkill = skill.trim();
    if (normalizedStudentSkills.includes(trimmedSkill.toLowerCase())) {
      matchingSkills.push(trimmedSkill);
    } else {
      missingSkills.push(trimmedSkill);
    }
  });

  const matchPercentage = Math.round((matchingSkills.length / jobSkills.length) * 100);

  return {
    matchPercentage,
    matchingSkills,
    missingSkills
  };
};

// @desc    Get all jobs / internships with filters, search, and pagination
// @route   GET /api/jobs
// @access  Public
exports.getJobs = async (req, res, next) => {
  try {
    const {
      search,
      location,
      category,
      jobType,
      workplaceMode,
      experienceLevel,
      status = 'Active',
      sort = 'newest',
      page = 1,
      limit = 12
    } = req.query;

    const query = {};

    // Only show Active jobs to public unless specifically requested
    if (status && status !== 'All') {
      query.status = status;
    } else if (!req.user || req.user.role === 'student') {
      query.status = 'Active';
    }

    // Keyword search across title, company, description, skills
    if (search && search.trim() !== '') {
      const term = search.trim();
      query.$or = [
        { title: { $regex: term, $options: 'i' } },
        { companyName: { $regex: term, $options: 'i' } },
        { description: { $regex: term, $options: 'i' } },
        { requiredSkills: { $regex: term, $options: 'i' } }
      ];
    }

    if (location && location.trim() !== '') {
      query.location = { $regex: location.trim(), $options: 'i' };
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (jobType && jobType !== 'All') {
      // Support comma-separated types or single type
      if (jobType.includes(',')) {
        query.jobType = { $in: jobType.split(',') };
      } else {
        query.jobType = jobType;
      }
    }

    if (workplaceMode && workplaceMode !== 'All') {
      query.workplaceMode = workplaceMode;
    }

    if (experienceLevel && experienceLevel !== 'All') {
      query.experienceLevel = experienceLevel;
    }

    // Sort order
    let sortOptions = { createdAt: -1 };
    if (sort === 'oldest') {
      sortOptions = { createdAt: 1 };
    } else if (sort === 'deadline') {
      sortOptions = { deadline: 1 };
    }

    const currentPage = parseInt(page, 10) || 1;
    const pageLimit = parseInt(limit, 10) || 12;
    const skip = (currentPage - 1) * pageLimit;

    const [total, jobs] = await Promise.all([
      Job.countDocuments(query),
      Job.find(query).sort(sortOptions).skip(skip).limit(pageLimit)
    ]);

    // If user is logged in as a student, enrich jobs with isSaved and hasApplied status
    let enrichedJobs = jobs.map((j) => j.toObject());

    if (req.user && req.user.role === 'student') {
      const jobIds = jobs.map((j) => j._id);
      const [savedList, appliedList, studentProfile] = await Promise.all([
        SavedJob.find({ studentId: req.user._id, jobId: { $in: jobIds } }).select('jobId'),
        Application.find({ studentId: req.user._id, jobId: { $in: jobIds } }).select('jobId status'),
        StudentProfile.findOne({ userId: req.user._id }).select('skills')
      ]);

      const savedSet = new Set(savedList.map((s) => s.jobId.toString()));
      const appliedMap = new Map(appliedList.map((a) => [a.jobId.toString(), a.status]));
      const studentSkills = studentProfile ? studentProfile.skills : [];

      enrichedJobs = enrichedJobs.map((job) => {
        const jobIdStr = job._id.toString();
        const skillAnalysis = calculateSkillMatch(studentSkills, job.requiredSkills);
        return {
          ...job,
          isSaved: savedSet.has(jobIdStr),
          hasApplied: appliedMap.has(jobIdStr),
          applicationStatus: appliedMap.get(jobIdStr) || null,
          matchPercentage: skillAnalysis.matchPercentage,
          matchingSkills: skillAnalysis.matchingSkills
        };
      });
    }

    res.json({
      success: true,
      count: enrichedJobs.length,
      total,
      page: currentPage,
      totalPages: Math.ceil(total / pageLimit) || 1,
      jobs: enrichedJobs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single job by ID
// @route   GET /api/jobs/:id
// @access  Public
exports.getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job listing not found.'
      });
    }

    const jobData = job.toObject();

    // Check if company has extra details
    if (job.companyId) {
      const company = await Company.findById(job.companyId);
      if (company) {
        jobData.company = company;
      }
    }

    // Enrich for logged-in students
    if (req.user && req.user.role === 'student') {
      const [saved, application, profile] = await Promise.all([
        SavedJob.findOne({ studentId: req.user._id, jobId: job._id }),
        Application.findOne({ studentId: req.user._id, jobId: job._id }),
        StudentProfile.findOne({ userId: req.user._id })
      ]);

      jobData.isSaved = !!saved;
      jobData.hasApplied = !!application;
      jobData.application = application || null;

      const studentSkills = profile ? profile.skills : [];
      const skillMatch = calculateSkillMatch(studentSkills, job.requiredSkills);
      jobData.skillAnalysis = {
        studentSkills,
        ...skillMatch
      };
    }

    res.json({
      success: true,
      job: jobData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new job listing
// @route   POST /api/jobs
// @access  Private (Employer only)
exports.createJob = async (req, res, next) => {
  try {
    const {
      title,
      companyName,
      category,
      description,
      responsibilities,
      requiredSkills,
      qualifications,
      experienceLevel,
      jobType,
      workplaceMode,
      location,
      salary,
      deadline
    } = req.body;

    // Check if employer has a company record
    let company = await Company.findOne({ employerId: req.user._id });
    if (!company) {
      company = await Company.create({
        employerId: req.user._id,
        companyName: companyName || `${req.user.name}'s Company`
      });
    }

    // Process skills into array if string passed
    let skillsArray = [];
    if (Array.isArray(requiredSkills)) {
      skillsArray = requiredSkills;
    } else if (typeof requiredSkills === 'string') {
      skillsArray = requiredSkills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }

    if (skillsArray.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one required skill.'
      });
    }

    const job = await Job.create({
      employerId: req.user._id,
      companyId: company._id,
      companyName: companyName || company.companyName,
      title,
      category,
      description,
      responsibilities: responsibilities || '',
      requiredSkills: skillsArray,
      qualifications: qualifications || '',
      experienceLevel: experienceLevel || 'Fresher',
      jobType,
      workplaceMode: workplaceMode || 'Onsite',
      location,
      salary: salary || 'Not Disclosed',
      deadline: deadline ? new Date(deadline) : null,
      status: 'Active'
    });

    res.status(201).json({
      success: true,
      message: 'Job listing posted successfully.',
      job
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a job listing
// @route   PATCH /api/jobs/:id
// @access  Private (Employer owner or Admin)
exports.updateJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job listing not found.'
      });
    }

    // Authorization check: employer can only update own job; admin can update any
    if (req.user.role !== 'admin' && job.employerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this job listing.'
      });
    }

    const updates = { ...req.body };

    // Parse requiredSkills if provided as string
    if (updates.requiredSkills && typeof updates.requiredSkills === 'string') {
      updates.requiredSkills = updates.requiredSkills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }

    if (updates.deadline) {
      updates.deadline = new Date(updates.deadline);
    }

    const updatedJob = await Job.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      message: 'Job listing updated successfully.',
      job: updatedJob
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a job listing
// @route   DELETE /api/jobs/:id
// @access  Private (Employer owner or Admin)
exports.deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job listing not found.'
      });
    }

    // Authorization check
    if (req.user.role !== 'admin' && job.employerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this job listing.'
      });
    }

    await Promise.all([
      Job.findByIdAndDelete(req.params.id),
      SavedJob.deleteMany({ jobId: req.params.id })
    ]);

    res.json({
      success: true,
      message: 'Job listing removed successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get skill-based job recommendations for logged-in student
// @route   GET /api/jobs/recommended
// @access  Private (Student)
exports.getRecommendations = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user._id });
    const studentSkills = profile ? profile.skills : [];

    if (!studentSkills || studentSkills.length === 0) {
      return res.json({
        success: true,
        message: 'Add skills to your profile to receive personalized recommendations.',
        recommendations: []
      });
    }

    // Fetch active jobs
    const activeJobs = await Job.find({ status: 'Active' });

    // Calculate match for each job
    const recommended = [];

    activeJobs.forEach((job) => {
      const match = calculateSkillMatch(studentSkills, job.requiredSkills);
      if (match.matchPercentage > 0) {
        recommended.push({
          ...job.toObject(),
          matchPercentage: match.matchPercentage,
          matchingSkills: match.matchingSkills,
          missingSkills: match.missingSkills
        });
      }
    });

    // Sort by match percentage descending
    recommended.sort((a, b) => b.matchPercentage - a.matchPercentage);

    res.json({
      success: true,
      studentSkills,
      count: recommended.length,
      recommendations: recommended.slice(0, 8) // Top 8 recommended jobs
    });
  } catch (error) {
    next(error);
  }
};

