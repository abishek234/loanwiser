const pool = require('../config/db').pool;

// Create a document type associated with an applicant and (optionally) a user
const createDocumentType = async ({ name, applicant_id, created_by }) => {
  const [result] = await pool.execute(
    'INSERT INTO document_types (name, applicant_id, created_by) VALUES (?, ?, ?)',
    [name, applicant_id, created_by]
  );
  return result.insertId;
};

// Get all document types globally
const getAllDocumentTypes = async () => {
  const [rows] = await pool.execute('SELECT * FROM document_types');
  return rows;
};

// Get document types for a specific applicant
const getDocumentTypesByApplicant = async (applicant_id) => {
  const [rows] = await pool.execute(
    'SELECT * FROM document_types WHERE applicant_id = ?',
    [applicant_id]
  );
  return rows;
};

// Get document type by ID
const getDocumentTypeById = async (id) => {
  const [rows] = await pool.execute('SELECT * FROM document_types WHERE id = ?', [id]);
  return rows[0];
};

module.exports = {
  createDocumentType,
  getAllDocumentTypes,
  getDocumentTypesByApplicant,
  getDocumentTypeById
};
