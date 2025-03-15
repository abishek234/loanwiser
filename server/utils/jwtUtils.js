const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_not_for_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

const generateToken = (userData) => {
  return jwt.sign(
    {
      id: userData.id,
      email: userData.email
    },

    JWT_SECRET,

    {
      expiresIn: JWT_EXPIRES_IN
    }
  );
};



const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error('JWT verification error:', error.message);
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken
};