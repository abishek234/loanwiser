const Document = require('../models/documentModel');
const Applicant = require('../models/applicantModel');
const fs = require('fs');

// Get all documents for an applicant
exports.getDocumentsByApplicant = async (req, res) => {
  try {
    const { applicantId } = req.params;
    
    // Check if applicant exists
    const applicant = await Applicant.findById(applicantId);
    
    if (!applicant) {
      return res.status(404).json({
        success: false,
        message: 'Applicant not found'
      });
    }
    
    // Get documents for the applicant
    const documents = await Document.getByApplicantId(applicantId);
    
    res.status(200).json({
      success: true,
      data: documents
    });
  } catch (error) {
    console.error('Error getting documents:', error);
    res.status(500).json({
      success: false,
      err: error,
      message: 'Server error while fetching documents'
    });
  }
};

// Get a single document
exports.getDocument = async (req, res) => {
  try {
    const { id } = req.params;
    
    const document = await Document.findById(id);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: document
    });
  } catch (error) {
    console.error('Error getting document:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching document'
    });
  }
};

// Upload a document
exports.uploadDocument = async (req, res) => {
  try {
    const { applicantId } = req.params;
    const { name } = req.body;
    
    // Validate input
    if (!name || !name.trim()) {
      // Delete the uploaded file if it exists
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      return res.status(400).json({
        success: false,
        message: 'Document name is required'
      });
    }
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    // Check if applicant exists
    const applicant = await Applicant.findById(applicantId);
    
    if (!applicant) {
      // Delete the uploaded file
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      return res.status(404).json({
        success: false,
        message: 'Applicant not found'
      });
    }
    
    // Get user ID from authenticated request
    const userId = req.user ? req.user.id : null;
    
    // Create document
    const newDocument = await Document.create({
      applicantId,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      filePath: req.file.path,
      status: 'Completed',
      userId
    });
    
    res.status(201).json({
      success: true,
      data: newDocument
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    
    // Delete the uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while uploading document'
    });
  }
};

// Update document
exports.updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status } = req.body;
    
    // Validate input
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Document name is required'
      });
    }
    
    // Check if document exists
    const document = await Document.findById(id);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
    
    // Validate status
    const validStatuses = ['Pending', 'Completed', 'Failed'];
    const updatedStatus = status || document.status;
    
    if (!validStatuses.includes(updatedStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }
    
    // Update document
    const updated = await Document.update(id, name.trim(), updatedStatus);
    
    if (updated) {
      res.status(200).json({
        success: true,
        message: 'Document updated successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to update document'
      });
    }
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating document'
    });
  }
};

// Delete document
exports.deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if document exists
    const document = await Document.findById(id);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
    
    // Delete document
    const deleted = await Document.delete(id);
    
    if (deleted) {
      res.status(200).json({
        success: true,
        message: 'Document deleted successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to delete document'
      });
    }
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting document'
    });
  }
};

// Download document
exports.downloadDocument = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the document
    const document = await Document.findById(id);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
    
    // Check if file exists
    if (!fs.existsSync(document.filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }
    
    // Set headers for download
    res.setHeader('Content-Disposition', `attachment; filename="${document.originalName}"`);
    res.setHeader('Content-Type', document.mimetype);
    
    // Send the file
    const fileStream = fs.createReadStream(document.filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error downloading document:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while downloading document'
    });
  }
};