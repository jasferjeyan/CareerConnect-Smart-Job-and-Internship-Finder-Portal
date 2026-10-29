const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { authenticate, authorizeRoles } = require('../middleware/auth');

// Student routes
router.get('/me', authenticate, authorizeRoles('student'), applicationController.getMyApplications);
router.patch('/:id/withdraw', authenticate, authorizeRoles('student'), applicationController.withdrawApplication);

// Employer routes
router.get('/employer/all', authenticate, authorizeRoles('employer'), applicationController.getEmployerApplications);
router.patch('/:id/status', authenticate, authorizeRoles('employer', 'admin'), applicationController.updateApplicationStatus);

module.exports = router;

