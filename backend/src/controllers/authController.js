const User = require('../models/User');
const { hashPassword, comparePassword } = require('../utils/bcrypt');
const { generateTokenPair } = require('../utils/jwt');
const { createOTP, verifyOTP } = require('../utils/otpService');
const { sendOTPEmail } = require('../utils/emailService');
const { cleanupExpiredAccounts, cancelAccountDeletion } = require('../utils/cleanup');

const signup = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check if verified user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password and create OTP without saving user to database
    const hashedPassword = await hashPassword(password);
    const otp = await createOTP(email, 'signup');
    
    // Store user data temporarily in OTP metadata
    await OTP.findOneAndUpdate(
      { email, type: 'signup' },
      { 
        metadata: {
          email,
          password: hashedPassword,
          name: name || email.split('@')[0]
        }
      }
    );

    const emailSent = await sendOTPEmail(email, otp, 'signup');
    if (!emailSent) {
      await OTP.deleteMany({ email, type: 'signup' });
      return res.status(500).json({ error: 'Failed to send verification email' });
    }

    console.log('Email sent successfully to:', email);
    res.status(201).json({
      message: 'Verification email sent. Please check your inbox.',
      email: email
    });
  } catch (error) {
    console.error('Signup error:', error);
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

    // Get user data from OTP metadata
    const otpDoc = await OTP.findOne({ email, type: 'signup', isUsed: true });
    if (!otpDoc || !otpDoc.metadata) {
      return res.status(400).json({ error: 'Verification data not found' });
    }

    const { password, name } = otpDoc.metadata;

    // Now create the user in database
    const user = new User({
      email,
      password,
      name,
      isVerified: true,
      lastLogin: new Date()
    });

    await user.save();

    // Clean up OTP
    await OTP.deleteMany({ email, type: 'signup' });

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

    try {
      await cleanupExpiredAccounts();
    } catch (cleanupError) {
      console.error('Cleanup error during login:', cleanupError);
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // All users in database are verified, so no need to check isVerified
    if (user.deletionScheduledAt) {
      await cancelAccountDeletion(user._id);
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

    if (type === 'signup') {
      // For signup, check if there's existing OTP data
      const existingOTP = await OTP.findOne({ email, type: 'signup' });
      if (!existingOTP || !existingOTP.metadata) {
        return res.status(400).json({ error: 'No pending signup found. Please start signup process again.' });
      }
    } else {
      // For other types, check if user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ error: 'User not found' });
      }
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

const sendProfileOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user || user.email !== email) {
      return res.status(400).json({ error: 'Invalid user' });
    }

    const otp = await createOTP(email, 'profile-update');
    const emailSent = await sendOTPEmail(email, otp, 'profile-update');

    if (!emailSent) {
      return res.status(500).json({ error: 'Failed to send OTP' });
    }

    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    res.status(500).json({ error: `Server error: ${error.message}` });
  }
};

const verifyProfileOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user || user.email !== email) {
      return res.status(400).json({ error: 'Invalid user' });
    }

    const isValidOTP = await verifyOTP(email, otp, 'profile-update');
    if (!isValidOTP) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    res.status(500).json({ error: `Server error: ${error.message}` });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, religion, dob, address, pincode, city, state, country, mobile } = req.body;

    const updateData = {
      name,
      religion,
      dob: dob ? new Date(dob) : undefined,
      address,
      pincode,
      city,
      state,
      country,
      mobile
    };

    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined || updateData[key] === '') {
        delete updateData[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        religion: user.religion,
        dob: user.dob,
        address: user.address,
        pincode: user.pincode,
        city: user.city,
        state: user.state,
        country: user.country,
        mobile: user.mobile
      }
    });
  } catch (error) {
    res.status(500).json({ error: `Server error: ${error.message}` });
  }
};

const sendPasswordChangeOTP = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const isValidPassword = await comparePassword(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    const otp = await createOTP(user.email, 'password-change');
    const emailSent = await sendOTPEmail(user.email, otp, 'password-change');

    if (!emailSent) {
      return res.status(500).json({ error: 'Failed to send OTP' });
    }

    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    res.status(500).json({ error: `Server error: ${error.message}` });
  }
};

const verifyPasswordChangeOTP = async (req, res) => {
  try {
    const { otp, currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const isValidPassword = await comparePassword(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    const isValidOTP = await verifyOTP(user.email, otp, 'password-change');
    if (!isValidOTP) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    const hashedPassword = await hashPassword(newPassword);
    await User.findByIdAndUpdate(userId, { password: hashedPassword });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ error: `Server error: ${error.message}` });
  }
};

const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const isValidPassword = await comparePassword(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    const hashedPassword = await hashPassword(newPassword);
    await User.findByIdAndUpdate(userId, { password: hashedPassword });

    res.json({ message: 'Password changed successfully' });
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
  resendOTP,
  sendProfileOTP,
  verifyProfileOTP,
  updateProfile,
  sendPasswordChangeOTP,
  verifyPasswordChangeOTP,
  changePassword
};