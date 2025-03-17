const express = require('express');
const router = express.Router();
const {
  addDocumentType,
  getAllDocumentTypes,
  getDocumentTypeById,
    getDocumentTypesByApplicantId,
} = require('../controllers/documenttypeController');

// POST /api/document-types
router.post('/', addDocumentType);

// GET /api/document-types
router.get('/', getAllDocumentTypes);

// GET /api/document-types/:id
router.get('/:id', getDocumentTypeById);

// GET /api/document-types/applicant/:applicant_id
router.get('/applicant/:applicant_id', getDocumentTypesByApplicantId);
module.exports = router;
