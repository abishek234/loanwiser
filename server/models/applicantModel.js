const { pool } = require('../config/db');
const fs = require('fs');
const path = require('path');

class Applicant {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.createdBy = data.created_by || data.createdBy;
    this.createdAt = data.created_at || data.createdAt;
  }

  // Create a new applicant
  static async create(name, userId) {
    try {
      const [result] = await pool.execute(
        'INSERT INTO applicants (name, created_by) VALUES (?, ?)',
        [name, userId]
      );
      
      return { id: result.insertId, name, createdBy: userId };
    } catch (error) {
      console.error('Error creating applicant:', error);
      throw error;
    }
  }

  // Get all applicants
  static async getAll(userId = null) {
    try {
      let query = 'SELECT * FROM applicants';
      let params = [];
      
      // If userId is provided, filter by created_by
      if (userId) {
        query += ' WHERE created_by = ?';
        params.push(userId);
      }
      
      query += ' ORDER BY created_at DESC';
      
      const [rows] = await pool.execute(query, params);
      
      return rows.map(row => new Applicant(row));
    } catch (error) {
      console.error('Error getting applicants:', error);
      throw error;
    }
  }

  // Find applicant by ID
  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM applicants WHERE id = ?',
        [id]
      );
      
      return rows.length > 0 ? new Applicant(rows[0]) : null;
    } catch (error) {
      console.error('Error finding applicant by ID:', error);
      throw error;
    }
  }

  // Update applicant
  static async update(id, name) {
    try {
      const [result] = await pool.execute(
        'UPDATE applicants SET name = ? WHERE id = ?',
        [name, id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating applicant:', error);
      throw error;
    }
  }

  // Delete applicant
  static async delete(id) {
    try {
      // First, get all documents for the applicant to delete files
      const [documents] = await pool.execute(
        'SELECT * FROM documents WHERE applicant_id = ?',
        [id]
      );
      
      // Delete associated files
      for (const doc of documents) {
        if (fs.existsSync(doc.file_path)) {
          fs.unlinkSync(doc.file_path);
        }
      }
      
      // Delete the applicant (this will cascade delete documents due to foreign key)
      const [result] = await pool.execute(
        'DELETE FROM applicants WHERE id = ?',
        [id]
      );
      
      // Delete applicant directory if it exists
      const uploadsDir = path.join(process.cwd(), 'uploads');
      const applicantDir = path.join(uploadsDir, id.toString());
      if (fs.existsSync(applicantDir)) {
        fs.rmSync(applicantDir, { recursive: true, force: true });
      }
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting applicant:', error);
      throw error;
    }
  }
}

module.exports = Applicant;