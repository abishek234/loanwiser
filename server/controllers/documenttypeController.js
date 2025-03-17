const DocumentType = require('../models/documenttypeModel');

const addDocumentType = async (req, res) => {
  try {
    const { name, applicant_id } = req.body;
    const created_by = req.user?.id || null; // Assuming you're using auth middleware

    if (!name || !applicant_id) {
      return res.status(400).json({ message: 'Name and applicant_id are required' });
    }

    const id = await DocumentType.createDocumentType({ name, applicant_id, created_by });
    res.status(201).json({ success: true, id, name });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Document type already exists for this applicant' });
    }
    console.error('Error adding document type:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


const getAllDocumentTypes = async (req, res) => {
    try {
      const { applicant_id } = req.query;
  
      const types = applicant_id
        ? await DocumentType.getDocumentTypesByApplicant(applicant_id)
        : await DocumentType.getAllDocumentTypes();
  
      res.status(200).json(types);
    } catch (error) {
      console.error('Error fetching document types:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  

  const getDocumentTypeById = async (req, res) => {
    try {
      const { id } = req.params;
      const type = await DocumentType.getDocumentTypeById(id);
  
      if (!type) {
        return res.status(404).json({ message: 'Document type not found' });
      }
  
      res.status(200).json(type);
    } catch (error) {
      console.error('Error fetching document type by ID:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };

  const getDocumentTypesByApplicantId = async (req, res) => {
    try {
      const { applicant_id } = req.params;
      const types = await DocumentType.getDocumentTypesByApplicant(applicant_id);
  
      res.status(200).json(types);
    } catch (error) {
      console.error('Error fetching document types by applicant ID:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
  

module.exports = {
  addDocumentType,
  getAllDocumentTypes,
  getDocumentTypeById,
    getDocumentTypesByApplicantId,
};
