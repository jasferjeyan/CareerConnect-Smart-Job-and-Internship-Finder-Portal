const express = require('express');
const router = express.Router();
const savedJobController = require('../controllers/savedJobController');
const { authenticate, authorizeRoles } = require('../middleware/auth');

router.get('/', authenticate, authorizeRoles('student'), savedJobController.getSavedJobs);
router.post('/:jobId', authenticate, authorizeRoles('student'), savedJobController.saveJob);
router.delete('/:jobId', authenticate, authorizeRoles('student'), savedJobController.removeSavedJob);

module.exports = router;

