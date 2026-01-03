const express = require('express');
const { 
  signup, 
  verifyEmail, 
  login, 
  forgotPassword, 
  resetPassword, 
  resendOTP 
} = require('../controllers/authController');
const { refreshToken } = require('../controllers/tokenController');
const { logout } = require('../controllers/logoutController');
const { getProfile } = require('../controllers/profileController');
const { authenticate } = require('../middleware/auth');
const { signupValidation, loginValidation } = require('../middleware/validation');

const router = express.Router();

router.post('/signup', signupValidation, signup);
router.post('/verify-email', verifyEmail);
router.post('/login', loginValidation, login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/resend-otp', resendOTP);
router.post('/refresh', refreshToken);
router.post('/logout', logout);
router.get('/profile', authenticate, getProfile);

module.exports = router;