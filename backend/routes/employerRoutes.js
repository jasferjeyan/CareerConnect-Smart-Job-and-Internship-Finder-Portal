const express = require('express');
const router = express.Router();
const employerController = require('../controllers/employerController');
const applicationController = require('../controllers/applicationController');
const { authenticate, authorizeRoles } = require('../middleware/auth');

router.get('/stats', authenticate, authorizeRoles('employer'), employerController.getEmployerStats);
router.get('/jobs', authenticate, authorizeRoles('employer'), employerController.getMyJobs);
router.get('/company', authenticate, authorizeRoles('employer'), employerController.getCompanyProfile);
router.patch('/company', authenticate, authorizeRoles('employer'), employerController.updateCompanyProfile);
router.get('/applications', authenticate, authorizeRoles('employer'), applicationController.getEmployerApplications);

module.exports = router;

