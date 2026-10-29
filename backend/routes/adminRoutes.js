const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorizeRoles } = require('../middleware/auth');

router.use(authenticate, authorizeRoles('admin'));

// Existing admin endpoints
router.get('/stats', adminController.getAdminStats);
router.get('/users', adminController.getAllUsers);
router.patch('/users/:id/status', adminController.toggleUserStatus);
router.delete('/users/:id', adminController.deleteUser);
router.get('/jobs', adminController.getAllJobsAdmin);
router.delete('/jobs/:id', adminController.deleteJobAdmin);

// Company management endpoints
router.get('/companies', adminController.getAllCompanies);
router.patch('/companies/:id/status', adminController.updateCompanyStatus);

module.exports = router;

