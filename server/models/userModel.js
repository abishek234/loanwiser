const { pool } = require('../config/db');

class User {
  static async findByEmail(email) {
    try {
      const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
      return users.length > 0 ? users[0] : null;
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }


  static async findById(id) {
    try {
      const [users] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
      return users.length > 0 ? users[0] : null;
    } catch (error) {
      console.error('Error finding user by id:', error);
      throw error;
    }
  }

  static async create(userData) {
    try {
      const { firstName, lastName, email, password } = userData;
      
      const [result] = await pool.execute(
        'INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)',
        [firstName, lastName, email, password]
      );
      
      return { id: result.insertId, firstName, lastName, email };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  static sanitizeUser(user) {
    if (!user) return null;
    
    return {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email
    };
  }
}

module.exports = User;