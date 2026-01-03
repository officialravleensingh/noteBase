const User = require('../models/User');
const { hashPassword, comparePassword } = require('../utils/bcrypt');
const { generateTokenPair } = require('../utils/jwt');
const { createOTP, verifyOTP } = require('../utils/otpService');
const { sendOTPEmail } = require('../utils/emailService');

const signup = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await hashPassword(password);

    const user = new User({
      email,
      password: hashedPassword,
      name: name || email.split('@')[0],
      isVerified: false
    });

    await user.save();

    // Generate and send OTP
    const otp = await createOTP(email, 'signup');
    const emailSent = await sendOTPEmail(email, otp, 'signup');

    if (!emailSent) {
      await User.findByIdAndDelete(user._id);
      return res.status(500).json({ error: 'Failed to send verification email' });
    }

    res.status(201).json({
      message: 'User created successfully. Please verify your email.',
      userId: user._id,
      email: user.email
    });
  } catch (error) {
    res.status(500).json({ error: `Server error: ${error.message}` });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const isValidOTP = await verifyOTP(email, otp, 'signup');
    if (!isValidOTP) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    const user = await User.findOneAndUpdate(
      { email },
      { isVerified: true, lastLogin: new Date() },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const { accessToken, refreshToken } = generateTokenPair(user._id);

    res.json({
      message: 'Email verified successfully',
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    res.status(500).json({ error: `Server error: ${error.message}` });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(400).json({ error: 'Please verify your email first' });
    }

    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    const { accessToken, refreshToken } = generateTokenPair(user._id);

    res.json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    res.status(500).json({ error: `Server error: ${error.message}` });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const otp = await createOTP(email, 'password-reset');
    const emailSent = await sendOTPEmail(email, otp, 'password-reset');

    if (!emailSent) {
      return res.status(500).json({ error: 'Failed to send reset email' });
    }

    res.json({ message: 'Password reset code sent to your email' });
  } catch (error) {
    res.status(500).json({ error: `Server error: ${error.message}` });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const isValidOTP = await verifyOTP(email, otp, 'password-reset');
    if (!isValidOTP) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    const hashedPassword = await hashPassword(newPassword);
    await User.findOneAndUpdate({ email }, { password: hashedPassword });

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ error: `Server error: ${error.message}` });
  }
};

const resendOTP = async (req, res) => {
  try {
    const { email, type } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
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

module.exports = { 
  signup, 
  verifyEmail, 
  login, 
  forgotPassword, 
  resetPassword, 
  resendOTP 
};