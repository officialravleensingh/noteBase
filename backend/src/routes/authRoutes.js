const express = require('express');
const { 
  signup, 
  verifyEmail, 
  login, 
  forgotPassword, 
  resetPassword, 
  resendOTP,
  sendProfileOTP,
  verifyProfileOTP,
  updateProfile,
  sendPasswordChangeOTP,
  verifyPasswordChangeOTP,
  changePassword
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

// Profile management routes
router.post('/send-profile-otp', authenticate, sendProfileOTP);
router.post('/verify-profile-otp', authenticate, verifyProfileOTP);
router.put('/update-profile', authenticate, updateProfile);

// Password change routes
router.post('/send-password-change-otp', authenticate, sendPasswordChangeOTP);
router.post('/verify-password-change-otp', authenticate, verifyPasswordChangeOTP);
router.put('/change-password', authenticate, changePassword);

module.exports = router;