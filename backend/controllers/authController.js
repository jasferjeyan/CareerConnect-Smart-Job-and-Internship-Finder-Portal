const jwt = require('jsonwebtoken');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const Company = require('../models/Company');

const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || 'careerconnect_super_secret_jwt_key_2026_secure',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// @desc    Register a new user (student or employer)
// Supports company registration with additional fields and pending approval
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, companyName, website, location, industry, description, college, degree } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    // Protect admin role from public registration (Section 11 requirement)
    let assignedRole = role ? role.toLowerCase() : 'student';
    if (assignedRole === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Administrator accounts cannot be created via public registration.'
      });
    }

    if (!['student', 'employer'].includes(assignedRole)) {
      assignedRole = 'student';
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: assignedRole
    });

    // Create associated role profile
    if (assignedRole === 'student') {
      await StudentProfile.create({
        userId: user._id,
        college: college || '',
        degree: degree || ''
      });
    } else if (assignedRole === 'employer') {
      // Create company profile with pending approval and additional details
      await Company.create({
        employerId: user._id,
        companyName: companyName || `${name}'s Company`,
        email: email,
        website: req.body.website || '',
        location: req.body.location || '',
        industry: req.body.industry || '',
        description: req.body.description || '',
        status: 'pending'
      });
    }

    const token = generateToken(user._id, user.role);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'This account has been deactivated. Please contact the administrator.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // If the user is an employer, ensure the company profile is approved
    if (user.role === 'employer') {
      const company = await Company.findOne({ employerId: user._id });
      if (!company) {
        return res.status(400).json({ success: false, message: 'Employer profile not found.' });
      }
      if (company.status === 'pending') {
        return res.status(403).json({ success: false, message: 'Your company registration is pending approval by the administrator.' });
      }
      if (company.status === 'rejected') {
        return res.status(403).json({ success: false, message: 'Your company registration has been rejected.' });
      }
    }

    const token = generateToken(user._id, user.role);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
exports.logout = (req, res) => {
  res.clearCookie('token');
  res.json({
    success: true,
    message: 'Logged out successfully.'
  });
};

// @desc    Get currently logged in user info & profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    let extraData = {};

    if (user.role === 'student') {
      extraData.profile = await StudentProfile.findOne({ userId: user._id });
    } else if (user.role === 'employer') {
      extraData.company = await Company.findOne({ employerId: user._id });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        ...extraData
      }
    });
  } catch (error) {
    next(error);
  }
};

