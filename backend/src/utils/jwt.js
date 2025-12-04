const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required for token generation');
    }
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is not set');
    }
    if (!process.env.JWT_EXPIRE) {
      throw new Error('JWT_EXPIRE environment variable is not set');
    }
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });
  } catch (error) {
    console.error('Token generation error:', error.message);
    throw new Error('Failed to generate token');
  }
};

const generateTokenPair = (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required for token generation');
    }
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is not set');
    }
    if (!process.env.JWT_EXPIRE || !process.env.JWT_REFRESH_EXPIRE) {
      throw new Error('JWT expiration environment variables are not set');
    }
    
    const accessToken = jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );
    
    const refreshToken = jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRE }
    );
    
    return { accessToken, refreshToken };
  } catch (error) {
    console.error('Token pair generation error:', error.message);
    throw new Error('Failed to generate token pair');
  }
};

const verifyToken = (token) => {
  try {
    if (!token) {
      throw new Error('Token is required for verification');
    }
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is not set');
    }
    
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token format');
    }
    if (error.name === 'TokenExpiredError') {
      throw error;
    }
    if (error.name === 'NotBeforeError') {
      throw new Error('Token not active yet');
    }
    console.error('Token verification error:', error.message);
    throw error;
  }
};

module.exports = { generateToken, generateTokenPair, verifyToken };