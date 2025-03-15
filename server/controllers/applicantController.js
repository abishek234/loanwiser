const Applicant = require('../models/applicantModel');

// Get all applicants
exports.getApplicants = async (req, res) => {
  try {
    // Get user ID from authenticated request
    const userId = req.user ? req.user.id : null;
    
    const applicants = await Applicant.getAll(userId);
    
    res.status(200).json({
      success: true,
      data: applicants
    });
  } catch (error) {
    console.error('Error getting applicants:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching applicants'
    });
  }
};

// Get single applicant by ID
exports.getApplicant = async (req, res) => {
  try {
    const { id } = req.params;
    
    const applicant = await Applicant.findById(id);
    
    if (!applicant) {
      return res.status(404).json({
        success: false,
        message: 'Applicant not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: applicant
    });
  } catch (error) {
    console.error('Error getting applicant:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching applicant'
    });
  }
};

// Create new applicant
exports.createApplicant = async (req, res) => {
  try {
    const { name } = req.body;
    
    // Validate input
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Applicant name is required'
      });
    }
    
    // Get user ID from authenticated request
    const userId = req.user ? req.user.id : null;
    
    const newApplicant = await Applicant.create(name.trim(), userId);
    
    res.status(201).json({
      success: true,
      data: newApplicant
    });
  } catch (error) {
    console.error('Error creating applicant:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating applicant'
    });
  }
};

// Update applicant
exports.updateApplicant = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    // Validate input
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Applicant name is required'
      });
    }
    
    // Check if applicant exists
    const applicant = await Applicant.findById(id);
    
    if (!applicant) {
      return res.status(404).json({
        success: false,
        message: 'Applicant not found'
      });
    }
    
    // Update applicant
    const updated = await Applicant.update(id, name.trim());
    
    if (updated) {
      res.status(200).json({
        success: true,
        message: 'Applicant updated successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to update applicant'
      });
    }
  } catch (error) {
    console.error('Error updating applicant:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating applicant'
    });
  }
};

// Delete applicant
exports.deleteApplicant = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if applicant exists
    const applicant = await Applicant.findById(id);
    
    if (!applicant) {
      return res.status(404).json({
        success: false,
        message: 'Applicant not found'
      });
    }
    
    // Delete applicant
    const deleted = await Applicant.delete(id);
    
    if (deleted) {
      res.status(200).json({
        success: true,
        message: 'Applicant deleted successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to delete applicant'
      });
    }
  } catch (error) {
    console.error('Error deleting applicant:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting applicant'
    });
  }
};