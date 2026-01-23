// Centralized validation and error handling
const { body, validationResult } = require('express-validator');

// Common validation rules
const validateEmail = body('email')
  .isEmail()
  .normalizeEmail()
  .withMessage('Please provide a valid email address');

const validatePassword = body('password')
  .isLength({ min: 6 })
  .withMessage('Password must be at least 6 characters long');

const validateOTP = body('otp')
  .isLength({ min: 6, max: 6 })
  .isNumeric()
  .withMessage('OTP must be exactly 6 digits');

const validatePIN = body('pin')
  .isLength({ min: 4, max: 4 })
  .isNumeric()
  .withMessage('PIN must be exactly 4 digits');

const validateNoteTitle = body('title')
  .optional()
  .isLength({ max: 200 })
  .withMessage('Title must be less than 200 characters');

const validateNoteContent = body('content')
  .optional()
  .isLength({ max: 50000 })
  .withMessage('Content must be less than 50,000 characters');

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Common error responses
const errorResponses = {
  INVALID_CREDENTIALS: { status: 401, message: 'Invalid credentials' },
  USER_NOT_FOUND: { status: 404, message: 'User not found' },
  NOTE_NOT_FOUND: { status: 404, message: 'Note not found' },
  FOLDER_NOT_FOUND: { status: 404, message: 'Folder not found' },
  INVALID_OTP: { status: 400, message: 'Invalid or expired OTP' },
  INVALID_PIN: { status: 400, message: 'Invalid PIN' },
  SERVER_ERROR: { status: 500, message: 'Internal server error' },
  UNAUTHORIZED: { status: 403, message: 'Unauthorized access' },
  DUPLICATE_TITLE: { status: 400, message: 'A note with this title already exists' }
};

const sendErrorResponse = (res, errorType, customMessage = null) => {
  const error = errorResponses[errorType];
  res.status(error.status).json({
    success: false,
    message: customMessage || error.message
  });
};

// Environment validation
const validateEnvironment = () => {
  const requiredEnvVars = [
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'DATABASE_URL',
    'EMAIL_USER',
    'EMAIL_PASS'
  ];

  const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
};

module.exports = {
  validateEmail,
  validatePassword,
  validateOTP,
  validatePIN,
  validateNoteTitle,
  validateNoteContent,
  handleValidationErrors,
  errorResponses,
  sendErrorResponse,
  validateEnvironment
};