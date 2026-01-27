const crypto = require('crypto');
const OTP = require('../models/OTP');
const { VALIDATION_LIMITS } = require('./constants');

const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

const createOTP = async (email, type) => {
  try {
    console.log('Creating OTP for:', email, 'type:', type);
    
    // For signup, preserve existing metadata
    let existingMetadata = null;
    if (type === 'signup') {
      const existingOTP = await OTP.findOne({ email, type });
      if (existingOTP && existingOTP.metadata) {
        existingMetadata = existingOTP.metadata;
      }
    }
    
    await OTP.deleteMany({ email, type });
    
    const otp = generateOTP();
    const otpDoc = new OTP({
      email,
      otp,
      type,
      metadata: existingMetadata,
      expiresAt: new Date(Date.now() + VALIDATION_LIMITS.OTP_EXPIRY_MINUTES * 60 * 1000)
    });
    
    await otpDoc.save();
    console.log('OTP created successfully:', otp);
    return otp;
  } catch (error) {
    console.error('OTP creation error:', error);
    throw new Error('Failed to create OTP');
  }
};

const verifyOTP = async (email, otp, type) => {
  try {
    console.log('=== OTP VERIFICATION DEBUG ===');
    console.log('Input:', { email, otp: otp, otpLength: otp?.length, type });
    
    const otpDoc = await OTP.findOne({
      email,
      otp,
      type,
      isUsed: false,
      expiresAt: { $gt: new Date() }
    });
    
    console.log('Found OTP document:', otpDoc ? 'YES' : 'NO');
    
    if (!otpDoc) {
      // Debug: Check all OTPs for this email and type
      const allOTPs = await OTP.find({ email, type }).sort({ createdAt: -1 });
      console.log('All OTPs for email/type:', allOTPs.map(otp => ({
        otp: otp.otp,
        isUsed: otp.isUsed,
        expired: otp.expiresAt < new Date(),
        createdAt: otp.createdAt,
        expiresAt: otp.expiresAt
      })));
      
      // Check if there's an exact match but with different criteria
      const exactOTP = await OTP.findOne({ email, otp, type });
      if (exactOTP) {
        console.log('Found exact OTP but failed criteria:', {
          isUsed: exactOTP.isUsed,
          expired: exactOTP.expiresAt < new Date(),
          expiresAt: exactOTP.expiresAt,
          now: new Date()
        });
      }
      
      console.log('=== END DEBUG ===');
      return false;
    }
    
    console.log('OTP verification successful, marking as used');
    otpDoc.isUsed = true;
    await otpDoc.save();
    console.log('=== END DEBUG ===');
    
    return true;
  } catch (error) {
    console.error('OTP verification error:', error);
    return false;
  }
};

module.exports = {
  createOTP,
  verifyOTP
};