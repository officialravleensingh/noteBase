const User = require('../models/User');
const SectionPin = require('../models/SectionPin');
const OTP = require('../models/OTP');
const bcrypt = require('bcryptjs');
const { sendEmail } = require('../utils/email');
const { sendOTPEmail } = require('../utils/emailService');

// Get user settings
const getSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('-password');
    
    // Check if PINs are set for sections
    const memoriesPin = await SectionPin.findOne({ userId, section: 'memories' });
    const journalPin = await SectionPin.findOne({ userId, section: 'journal' });
    
    res.json({
      user: {
        name: user.name,
        email: user.email,
        isGoogleUser: user.isGoogleUser,
        hasPassword: !user.isGoogleUser || !!user.password
      },
      pins: {
        memories: !!memoriesPin,
        journal: !!journalPin
      }
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Request OTP for PIN setup
const requestPinSetupOTP = async (req, res) => {
  try {
    const { section } = req.body;
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!['memories', 'journal'].includes(section)) {
      return res.status(400).json({ message: 'Invalid section' });
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP
    await OTP.findOneAndUpdate(
      { email: user.email, type: 'pin_setup' },
      { otp: otpCode, expiresAt, metadata: { section } },
      { upsert: true, new: true }
    );

    // Send email
    await sendEmail(
      user.email,
      'PIN Setup Verification',
      `Your verification code for setting up ${section} PIN is: ${otpCode}. This code expires in 10 minutes.`
    );

    res.json({ message: 'OTP sent to your email' });
  } catch (error) {
    console.error('Request PIN setup OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Verify OTP and allow PIN setup
const verifyPinSetupOTP = async (req, res) => {
  try {
    const { section, otp, pin } = req.body;
    const userId = req.user.id;
    const user = await User.findById(userId);

    // Validate inputs
    if (!['memories', 'journal'].includes(section)) {
      return res.status(400).json({ message: 'Invalid section' });
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({ message: 'OTP must be 6 digits' });
    }

    if (!/^\d{4}$/.test(pin)) {
      return res.status(400).json({ message: 'PIN must be 4 digits' });
    }

    // Verify OTP
    const otpRecord = await OTP.findOne({
      email: user.email,
      type: 'pin_setup',
      otp,
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord || otpRecord.metadata.section !== section) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Hash and save PIN
    const pinHash = await bcrypt.hash(pin, 12);
    await SectionPin.findOneAndUpdate(
      { userId, section },
      { pinHash },
      { upsert: true, new: true }
    );

    // Delete used OTP
    await OTP.deleteOne({ _id: otpRecord._id });

    res.json({ message: `${section} PIN set successfully` });
  } catch (error) {
    console.error('Verify PIN setup OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Request OTP for password change
const requestPasswordChangeOTP = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP
    await OTP.findOneAndUpdate(
      { email: user.email, type: 'password_change' },
      { otp: otpCode, expiresAt },
      { upsert: true, new: true }
    );

    // Send email
    await sendEmail(
      user.email,
      'Password Change Verification',
      `Your verification code for changing your password is: ${otpCode}. This code expires in 10 minutes.`
    );

    res.json({ message: 'OTP sent to your email' });
  } catch (error) {
    console.error('Request password change OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Verify OTP and change password
const verifyPasswordChangeOTP = async (req, res) => {
  try {
    const { otp, newPassword } = req.body;
    const userId = req.user.id;
    const user = await User.findById(userId);

    // Validate inputs
    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({ message: 'OTP must be 6 digits' });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Verify OTP
    const otpRecord = await OTP.findOne({
      email: user.email,
      type: 'password_change',
      otp,
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Hash and update password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await User.findByIdAndUpdate(userId, { password: hashedPassword });

    // Delete used OTP
    await OTP.deleteOne({ _id: otpRecord._id });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Verify password change OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Request OTP for profile deletion
const requestProfileDeletionOTP = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP
    await OTP.findOneAndUpdate(
      { email: user.email, type: 'profile_deletion' },
      { otp: otpCode, expiresAt },
      { upsert: true, new: true }
    );

    // Send email
    const emailSent = await sendOTPEmail(
      user.email,
      otpCode,
      'profile-deletion'
    );

    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send OTP email' });
    }

    res.json({ message: 'OTP sent to your email for profile deletion verification' });
  } catch (error) {
    console.error('Request profile deletion OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Verify OTP and schedule profile deletion
const verifyProfileDeletionOTP = async (req, res) => {
  try {
    const { otp } = req.body;
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate OTP
    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({ message: 'OTP must be 6 digits' });
    }

    // Verify OTP
    const otpRecord = await OTP.findOne({
      email: user.email,
      type: 'profile_deletion',
      otp,
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Schedule deletion for 7 days from now
    const deletionDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await User.findByIdAndUpdate(userId, {
      deletionScheduledAt: deletionDate
    });

    // Delete used OTP
    await OTP.deleteOne({ _id: otpRecord._id });

    // Send confirmation email
    try {
      await sendEmail(
        user.email,
        'Profile Deletion Scheduled',
        `Your profile has been scheduled for deletion on ${deletionDate.toDateString()}. If you log in before this date, the deletion will be cancelled automatically.`
      );
    } catch (emailError) {
      console.error('Failed to send deletion confirmation email:', emailError);
    }

    res.json({ 
      message: 'Profile deletion scheduled successfully',
      deletionDate: deletionDate.toISOString()
    });
  } catch (error) {
    console.error('Verify profile deletion OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Cancel profile deletion
const cancelProfileDeletion = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findByIdAndUpdate(
      userId,
      { $unset: { deletionScheduledAt: 1 } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Profile deletion cancelled successfully' });
  } catch (error) {
    console.error('Cancel profile deletion error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getSettings,
  requestPinSetupOTP,
  verifyPinSetupOTP,
  requestPasswordChangeOTP,
  verifyPasswordChangeOTP,
  requestProfileDeletionOTP,
  verifyProfileDeletionOTP,
  cancelProfileDeletion
};