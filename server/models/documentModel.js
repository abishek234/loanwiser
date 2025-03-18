const { pool } = require('../config/db');
const fs = require('fs');

class Document {
  constructor(data) {
    this.id = data.id;
    this.applicantId = data.applicant_id || data.applicantId;
    this.documentTypeId = data.document_type_id || data.documentTypeId;
    this.filename = data.filename;
    this.originalName = data.original_name || data.originalName;
    this.mimetype = data.mimetype;
    this.size = data.size;
    this.filePath = data.file_path || data.filePath;
    this.status = data.status || 'Completed';
    this.createdBy = data.created_by || data.createdBy;
    this.createdAt = data.created_at || data.createdAt;
  }

  // Create a new document
  static async create(documentData) {
    try {
      const {
        documentTypeId,
        applicantId,
        filename,
        originalName,
        mimetype,
        size,
        filePath,
        status = 'Completed',
        userId
      } = documentData;
      
      const [result] = await pool.execute(
        `INSERT INTO documents 
          (document_type_id,applicant_id, filename, original_name, mimetype, size, file_path, status, created_by) 
         VALUES (?,?, ?, ?, ?, ?, ?, ?, ?)`,
        [documentTypeId,applicantId, filename, originalName, mimetype, size, filePath, status, userId]
      );
      
      return {
        id: result.insertId,
        documentTypeId,
        applicantId,
        filename,
        originalName,
        mimetype,
        size,
        filePath,
        status,
        createdBy: userId
      };
    } catch (error) {
      // If there's an error, attempt to delete the file that was uploaded
      if (documentData.filePath && fs.existsSync(documentData.filePath)) {
        fs.unlinkSync(documentData.filePath);
      }
      
      console.error('Error creating document:', error);
      throw error;
    }
  }

  // Get all documents for an applicant
  static async getByApplicantId(applicantId) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM documents WHERE applicant_id = ? ORDER BY created_at DESC',
        [applicantId]
      );
      
      return rows.map(row => new Document(row));
    } catch (error) {
      console.error('Error getting documents by applicant ID:', error);
      throw error;
    }
  }

  // Find document by ID
  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM documents WHERE id = ?',
        [id]
      );
      
      return rows.length > 0 ? new Document(rows[0]) : null;
    } catch (error) {
      console.error('Error finding document by ID:', error);
      throw error;
    }
  }

  // Update document
  static async update(id, name, status) {
    try {
      const [result] = await pool.execute(
        'UPDATE documents SET original_name = ?, status = ? WHERE id = ?',
        [originalName, status, id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  }

  // Delete document
  static async delete(id) {
    try {
      // First, get the document to delete the file
      const document = await this.findById(id);
      
      if (!document) {
        return false;
      }
      
      // Delete the file
      if (fs.existsSync(document.filePath)) {
        fs.unlinkSync(document.filePath);
      }
      
      // Delete the database record
      const [result] = await pool.execute(
        'DELETE FROM documents WHERE id = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  // Delete all documents for an applicant
  static async deleteByApplicantId(applicantId) {
    try {
      // First, get all documents for this applicant
      const documents = await this.getByApplicantId(applicantId);
      
      // Delete all the files
      for (const doc of documents) {
        if (fs.existsSync(doc.filePath)) {
          fs.unlinkSync(doc.filePath);
        }
      }
      
      // Delete the database records
      const [result] = await pool.execute(
        'DELETE FROM documents WHERE applicant_id = ?',
        [applicantId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting documents by applicant ID:', error);
      throw error;
    }
  }
}

module.exports = Document;