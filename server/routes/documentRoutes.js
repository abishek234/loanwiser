const express = require('express');
const documentController = require('../controllers/documentController');
const upload = require('../middleware/upload');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Get all documents for an applicant
// Protected route - requires authentication
router.get(
  '/applicants/:applicantId/documents',
  authMiddleware.protect,
  documentController.getDocumentsByApplicant
);

// Upload a document for an applicant
// Protected route - requires authentication
router.post(
  '/applicants/:applicantId/documents',
  authMiddleware.protect,
  upload.single('document'),
  documentController.uploadDocument
);

// Get a single document
// Protected route - requires authentication
router.get(
  '/documents/:id',
  authMiddleware.protect,
  documentController.getDocument
);

// Update a document
// Protected route - requires authentication
router.put(
  '/documents/:id',
  authMiddleware.protect,
  documentController.updateDocument
);

// Delete a document
// Protected route - requires authentication
router.delete(
  '/documents/:id',
  authMiddleware.protect,
  documentController.deleteDocument
);

// Download a document
// Protected route - requires authentication
router.get(
  '/documents/:id/download',
  authMiddleware.protect,
  documentController.downloadDocument
);

module.exports = router;