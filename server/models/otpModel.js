const { pool } = require('../config/db');
class OTP {

  static async create(userId, otp, expiresAt) {
    try {
      await this.deleteByUserId(userId);
      
      const [result] = await pool.execute(
        'INSERT INTO otp_storage (user_id, otp, expires_at) VALUES (?, ?, ?)',
        [userId, otp, expiresAt]
      );
      
      return { id: result.insertId, userId, otp, expiresAt };
    } catch (error) {
      console.error('Error creating OTP:', error);
      throw error;
    }
  }

  static async verify(userId, otp) {
    try {
      const [otpRecords] = await pool.execute(
        'SELECT * FROM otp_storage WHERE user_id = ? AND otp = ? AND expires_at > NOW()',
        [userId, otp]
      );
      
      return otpRecords.length > 0 ? otpRecords[0] : null;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw error;
    }
  }


  static async deleteById(id) {
    try {
      await pool.execute('DELETE FROM otp_storage WHERE id = ?', [id]);
      return true;
    } catch (error) {
      console.error('Error deleting OTP by id:', error);
      throw error;
    }
  }

  static async deleteByUserId(userId) {
    try {
      await pool.execute('DELETE FROM otp_storage WHERE user_id = ?', [userId]);
      return true;
    } catch (error) {
      console.error('Error deleting OTPs by user id:', error);
      throw error;
    }
  }
}

module.exports = OTP;