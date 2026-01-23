const mongoose = require('mongoose');

const noteLockOTPSchema = new mongoose.Schema({
  noteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Note',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  otp: {
    type: String,
    required: true
  },
  purpose: {
    type: String,
    enum: ['unlock', 'reset-pin'],
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
  },
  isUsed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for cleanup of expired OTPs
noteLockOTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
noteLockOTPSchema.index({ noteId: 1, userId: 1 });

module.exports = mongoose.model('NoteLockOTP', noteLockOTPSchema);