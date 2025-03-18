import axios from 'axios';

const API_URL = 'https://loanwiser.onrender.com/api/applicant';

// Create axios instance with auth header
const createAuthHeader = () => {
  const token = localStorage.getItem('authToken');
  return {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
};

// Get all applicants
export const getApplicants = async () => {
  try {
    const config = createAuthHeader();
    const response = await axios.get(`${API_URL}/applicants`, config);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch applicants' };
  }
};

// Get single applicant by ID
export const getApplicant = async (id) => {
  try {
    const config = createAuthHeader();
    const response = await axios.get(`${API_URL}/applicants/${id}`, config);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch applicant' };
  }
};

// Create new applicant
export const createApplicant = async (name) => {
  try {
    const config = createAuthHeader();
    const response = await axios.post(
      `${API_URL}/applicants`, 
      { name }, 
      config
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to create applicant' };
  }
};

// Update applicant
export const updateApplicant = async (id, name) => {
  try {
    const config = createAuthHeader();
    const response = await axios.put(
      `${API_URL}/applicants/${id}`, 
      { name }, 
      config
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to update applicant' };
  }
};

// Delete applicant
export const deleteApplicant = async (id) => {
  try {
    const config = createAuthHeader();
    const response = await axios.delete(`${API_URL}/applicants/${id}`, config);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to delete applicant' };
  }
};

export default {
  getApplicants,
  getApplicant,
  createApplicant,
  updateApplicant,
  deleteApplicant
};