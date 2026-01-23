const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function() {
      return !this.isOAuthUser;
    }
  },
  isOAuthUser: {
    type: Boolean,
    default: false
  },
  name: {
    type: String,
    trim: true
  },
  avatar: {
    type: String
  },
  religion: {
    type: String,
    trim: true
  },
  dob: {
    type: Date
  },
  address: {
    type: String,
    trim: true
  },
  pincode: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
  state: {
    type: String,
    trim: true
  },
  country: {
    type: String,
    trim: true
  },
  mobile: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date
  },
  deletionScheduledAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

userSchema.index({ createdAt: 1 });

module.exports = mongoose.model('User', userSchema);