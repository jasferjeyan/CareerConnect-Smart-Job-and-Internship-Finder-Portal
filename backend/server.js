require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const profileRoutes = require('./routes/profileRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const savedJobRoutes = require('./routes/savedJobRoutes');
const employerRoutes = require('./routes/employerRoutes');
const adminRoutes = require('./routes/adminRoutes');
const companyRoutes = require('./routes/companyRoutes');

const app = express();

// Connect Database
connectDB();

// Security HTTP headers (customized to allow modern inline scripts & fonts in demo)
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  })
);

// Enable CORS with credentials support
app.use(
  cors({
    origin: true,
    credentials: true
  })
);

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Rate Limiter for Auth Routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per 15 mins
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// API Routes Mount
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/saved-jobs', savedJobRoutes);
app.use('/api/employer', employerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/company', companyRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'CareerConnect Portal API is running smoothly.',
    timestamp: new Date().toISOString()
  });
});

// Serve Frontend Static Assets
const frontendDir = path.join(__dirname, '../frontend');
app.use(express.static(frontendDir));

// Route aliases for clean URLs
const htmlRoutes = [
  { path: '/', file: 'index.html' },
  { path: '/jobs', file: 'jobs.html' },
  { path: '/internships', file: 'internships.html' },
  { path: '/job-details', file: 'job-details.html' },
  { path: '/login', file: 'login.html' },
  { path: '/register', file: 'register.html' },
  { path: '/student-dashboard', file: 'student-dashboard.html' },
  { path: '/profile', file: 'profile.html' },
  { path: '/resume-upload', file: 'resume-upload.html' },
  { path: '/applications', file: 'applications.html' },
  { path: '/saved-jobs', file: 'saved-jobs.html' },
  { path: '/employer-dashboard', file: 'employer-dashboard.html' },
  { path: '/post-job', file: 'post-job.html' },
  { path: '/manage-jobs', file: 'manage-jobs.html' },
  { path: '/applicants', file: 'applicants.html' },
  { path: '/admin-dashboard', file: 'admin-dashboard.html' },
  { path: '/about', file: 'about.html' },
  { path: '/contact', file: 'contact.html' }
];

htmlRoutes.forEach((route) => {
  app.get(route.path, (req, res) => {
    res.sendFile(path.join(frontendDir, route.file));
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' not found.`
  });
});

// Fallback to index.html for non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDir, 'index.html'));
});

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` CareerConnect Server running at: http://localhost:${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(` API Docs & Endpoints: http://localhost:${PORT}/api/health`);
  console.log(`=======================================================`);
});

