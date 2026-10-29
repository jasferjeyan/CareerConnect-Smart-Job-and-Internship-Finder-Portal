const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const applicationController = require('../controllers/applicationController');
const { authenticate, optionalAuth, authorizeRoles } = require('../middleware/auth');

// Public routes (with optional auth to detect saved/applied state)
router.get('/', optionalAuth, jobController.getJobs);
router.get('/recommended', authenticate, authorizeRoles('student'), jobController.getRecommendations);
router.get('/:id', optionalAuth, jobController.getJobById);

// Job application route
router.post('/:id/apply', authenticate, authorizeRoles('student'), applicationController.applyForJob);

// Employer management routes
router.post('/', authenticate, authorizeRoles('employer'), jobController.createJob);
router.patch('/:id', authenticate, authorizeRoles('employer', 'admin'), jobController.updateJob);
router.delete('/:id', authenticate, authorizeRoles('employer', 'admin'), jobController.deleteJob);

module.exports = router;

