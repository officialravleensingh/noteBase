const crypto = require('crypto');
const OTP = require('../models/OTP');

const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

const createOTP = async (email, type) => {
  try {
    await OTP.deleteMany({ email, type });
    
    const otp = generateOTP();
    const otpDoc = new OTP({
      email,
      otp,
      type,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });
    
    await otpDoc.save();
    return otp;
  } catch (error) {
    throw new Error('Failed to create OTP');
  }
};

const verifyOTP = async (email, otp, type) => {
  try {
    const otpDoc = await OTP.findOne({
      email,
      otp,
      type,
      isUsed: false,
      expiresAt: { $gt: new Date() }
    });
    
    if (!otpDoc) {
      return false;
    }
    
    otpDoc.isUsed = true;
    await otpDoc.save();
    
    return true;
  } catch (error) {
    return false;
  }
};

module.exports = {
  createOTP,
  verifyOTP
};