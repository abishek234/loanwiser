const express = require('express');
const applicantController = require('../controllers/applicantController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Get all applicants
// Protected route - requires authentication
router.get('/applicants', authMiddleware.protect, applicantController.getApplicants);

// Get single applicant
// Protected route - requires authentication
router.get('/applicants/:id', authMiddleware.protect, applicantController.getApplicant);

// Create new applicant
// Protected route - requires authentication
router.post('/applicants', authMiddleware.protect, applicantController.createApplicant);

// Update applicant
// Protected route - requires authentication
router.put('/applicants/:id', authMiddleware.protect, applicantController.updateApplicant);

// Delete applicant
// Protected route - requires authentication
router.delete('/applicants/:id', authMiddleware.protect, applicantController.deleteApplicant);

module.exports = router;