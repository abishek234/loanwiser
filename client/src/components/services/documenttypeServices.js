import axios from 'axios';

const API_URL = 'https://loanwiser.onrender.com/api/document-types';

// Create axios instance with auth header
const createAuthHeader = () => {
  const token = localStorage.getItem('authToken');
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

// ✅ Create a new document type (with applicant_id)
export const createDocumentType = async (name, applicant_id) => {
  try {
    const config = createAuthHeader();
    const response = await axios.post(API_URL, { name, applicant_id }, config);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to create document type' };
  }
};

// ✅ Get all document types (globally)
export const getAllDocumentTypes = async () => {
  try {
    const config = createAuthHeader();
    const response = await axios.get(API_URL, config);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch document types' };
  }
};

// ✅ Get document types for a specific applicant
export const getDocumentTypesByApplicant = async (applicantId) => {
  try {
    const config = createAuthHeader();
    const response = await axios.get(`${API_URL}/applicant/${applicantId}`, config);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch applicant document types' };
  }
};

// ✅ Get a specific document type by ID
export const getDocumentTypeById = async (id) => {
  try {
    const config = createAuthHeader();
    const response = await axios.get(`${API_URL}/${id}`, config);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch document type' };
  }
};

export default {
  createDocumentType,
  getAllDocumentTypes,
  getDocumentTypesByApplicant,
  getDocumentTypeById
};
