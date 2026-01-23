const mongoose = require('mongoose');

const userSettingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  featuresEnabled: {
    notes: { type: Boolean, default: true },
    memories: { type: Boolean, default: true },
    journal: { type: Boolean, default: true }
  },
  preferences: {
    autoSaveInterval: { type: Number, default: 30 },
    theme: { type: String, default: 'light' },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('UserSettings', userSettingsSchema);