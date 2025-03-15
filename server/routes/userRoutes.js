// File: routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  requestLoginOTP, 
  verifyLoginOTP, 
  loginWithPassword 
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');


router.post('/register', registerUser);


router.post('/login/request-otp', requestLoginOTP);
router.post('/login/verify-otp', verifyLoginOTP);


router.post('/login/password', loginWithPassword);


router.get('/profile', protect, (req, res) => {
  
  res.status(200).json({
    success: true,
    user: req.user
  });
});

module.exports = router;