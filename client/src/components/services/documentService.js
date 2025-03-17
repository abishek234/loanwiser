import axios from 'axios';

const API_URL = 'http://localhost:8000/api/document';

// Create axios instance with auth header
const createAuthHeader = () => {
  const token = localStorage.getItem('authToken');
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data' // Required for file uploads
    }
  };
};

// Get all documents for an applicant
export const getDocumentsByApplicant = async (applicantId) => {
  try {
    const config = createAuthHeader();
    config.headers['Content-Type'] = 'application/json'; // Reset content type for non-file requests
    
    const response = await axios.get(
      `${API_URL}/documents/applicant/${applicantId}`, 
      config
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch documents' };
  }
};

// Get a single document
export const getDocument = async (id) => {
  try {
    const config = createAuthHeader();
    config.headers['Content-Type'] = 'application/json'; // Reset content type for non-file requests
    
    const response = await axios.get(`${API_URL}/documents/${id}`, config);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch document' };
  }
};

// Upload a document
export const uploadDocument = async (applicantId, name, file) => {
  try {
    const config = createAuthHeader();
    
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('name', name);
    formData.append('document', file);

    console.log("formdata",formData);
    
    const response = await axios.post(
      `${API_URL}/applicants/${applicantId}/documents`, 
      formData, 
      config
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to upload document' };
  }
};

// Update document
export const updateDocument = async (id, name, status) => {
  try {
    const config = createAuthHeader();
    config.headers['Content-Type'] = 'application/json'; // Reset content type for non-file requests
    
    const response = await axios.put(
      `${API_URL}/documents/${id}`, 
      { name, status }, 
      config
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to update document' };
  }
};

// Delete document
export const deleteDocument = async (id) => {
  try {
    const config = createAuthHeader();
    config.headers['Content-Type'] = 'application/json'; // Reset content type for non-file requests
    
    const response = await axios.delete(`${API_URL}/documents/${id}`, config);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to delete document' };
  }
};

// Download document
export const downloadDocument = async (id) => {
  try {
    const token = localStorage.getItem('authToken');
    
    // Create URL for download with token
    const downloadUrl = `${API_URL}/documents/${id}/download`;
    
    // Use axios to get the file with responseType 'blob'
    const response = await axios.get(downloadUrl, {
      headers: { 'Authorization': `Bearer ${token}` },
      responseType: 'blob'
    });
    
    return {
      success: true,
      data: response.data,
      headers: response.headers
    };
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to download document' };
  }
};

export default {
  getDocumentsByApplicant,
  getDocument,
  uploadDocument,
  updateDocument,
  deleteDocument,
  downloadDocument
};