const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');
const { authenticate, authorizeRoles } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post(
  '/',
  authenticate,
  authorizeRoles('student'),
  upload.single('resume'),
  resumeController.uploadResume
);

router.get('/', authenticate, authorizeRoles('student'), resumeController.getMyResumes);
router.get('/:id/view', authenticate, resumeController.getResumeFile);
router.get('/:id/download', authenticate, resumeController.getResumeFile);
router.delete('/:id', authenticate, authorizeRoles('student', 'admin'), resumeController.deleteResume);

module.exports = router;

