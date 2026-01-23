const express = require('express');
const router = express.Router();
const {
  getSettings,
  requestPinSetupOTP,
  verifyPinSetupOTP,
  requestPasswordChangeOTP,
  verifyPasswordChangeOTP,
  requestProfileDeletionOTP,
  verifyProfileDeletionOTP,
  cancelProfileDeletion
} = require('../controllers/settingsController');
const { authenticate } = require('../middleware/auth');

// All settings routes require authentication
router.use(authenticate);

// Get user settings
router.get('/settings', getSettings);

// PIN setup with OTP validation
router.post('/pin-setup/request-otp', requestPinSetupOTP);
router.post('/pin-setup/verify-otp', verifyPinSetupOTP);

// Password change with OTP validation
router.post('/password-change/request-otp', requestPasswordChangeOTP);
router.post('/password-change/verify-otp', verifyPasswordChangeOTP);

// Profile deletion with OTP validation
router.post('/profile-deletion/request-otp', requestProfileDeletionOTP);
router.post('/profile-deletion/verify-otp', verifyProfileDeletionOTP);
router.post('/profile-deletion/cancel', cancelProfileDeletion);

module.exports = router;