const StudentProfile = require('../models/StudentProfile');
const User = require('../models/User');

// @desc    Get student profile
// @route   GET /api/profile
// @access  Private (Student)
exports.getProfile = async (req, res, next) => {
  try {
    let profile = await StudentProfile.findOne({ userId: req.user._id }).populate(
      'defaultResumeId'
    );

    if (!profile) {
      profile = await StudentProfile.create({
        userId: req.user._id
      });
    }

    res.json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email
      },
      profile
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update student profile
// @route   PATCH /api/profile
// @access  Private (Student)
exports.updateProfile = async (req, res, next) => {
  try {
    const {
      name,
      phone,
      college,
      degree,
      graduationYear,
      skills,
      educationDetails,
      portfolioUrl,
      githubUrl,
      linkedinUrl,
      defaultResumeId
    } = req.body;

    // Update user name if provided
    if (name && name.trim() !== '') {
      await User.findByIdAndUpdate(req.user._id, { name: name.trim() });
    }

    // Process skills into array
    let skillsArray = [];
    if (Array.isArray(skills)) {
      skillsArray = skills.map((s) => s.trim()).filter(Boolean);
    } else if (typeof skills === 'string') {
      skillsArray = skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }

    const updateData = {
      phone: phone || '',
      college: college || '',
      degree: degree || '',
      graduationYear: graduationYear ? Number(graduationYear) : null,
      skills: skillsArray,
      educationDetails: educationDetails || '',
      portfolioUrl: portfolioUrl || '',
      githubUrl: githubUrl || '',
      linkedinUrl: linkedinUrl || ''
    };

    if (defaultResumeId) {
      updateData.defaultResumeId = defaultResumeId;
    }

    const profile = await StudentProfile.findOneAndUpdate(
      { userId: req.user._id },
      updateData,
      { new: true, upsert: true }
    );

    const updatedUser = await User.findById(req.user._id).select('name email role');

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: updatedUser,
      profile
    });
  } catch (error) {
    next(error);
  }
};

