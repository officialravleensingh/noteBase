const { createOTP, verifyOTP } = require('../utils/otpService');
const { sendOTPEmail } = require('../utils/emailService');
const User = require('../models/User');

const sendOTP = async (req, res) => {
  try {
    const { email, type } = req.body;

    if (!['signup', 'password-reset'].includes(type)) {
      return res.status(400).json({ error: 'Invalid OTP type' });
    }

    const user = await User.findOne({ email });
    
    if (type === 'signup' && user && user.isVerified) {
      return res.status(400).json({ error: 'User already verified' });
    }
    
    if (type === 'password-reset' && !user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const otp = await createOTP(email, type);
    const emailSent = await sendOTPEmail(email, otp, type);

    if (!emailSent) {
      return res.status(500).json({ error: 'Failed to send OTP' });
    }

    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    res.status(500).json({ error: `Server error: ${error.message}` });
  }
};

const validateOTP = async (req, res) => {
  try {
    const { email, otp, type } = req.body;

    const isValid = await verifyOTP(email, otp, type);
    
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    res.status(500).json({ error: `Server error: ${error.message}` });
  }
};

module.exports = {
  sendOTP,
  validateOTP
};