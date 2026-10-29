const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { authenticate, authorizeRoles } = require('../middleware/auth');

router.get('/', authenticate, authorizeRoles('student'), profileController.getProfile);
router.patch('/', authenticate, authorizeRoles('student'), profileController.updateProfile);

module.exports = router;

