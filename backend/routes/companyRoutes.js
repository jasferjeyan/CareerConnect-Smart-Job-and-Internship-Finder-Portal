const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const { authenticate, authorizeRoles } = require('../middleware/auth');

// All company endpoints require authenticated employer
router.use(authenticate, authorizeRoles('employer'));

router.get('/me', companyController.getProfile);
router.patch('/me', companyController.updateProfile);

module.exports = router;

