const mongoose = require('mongoose');

const sectionPinSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  section: {
    type: String,
    enum: ['memories', 'journal'],
    required: true
  },
  pinHash: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Compound index to ensure one PIN per user per section
sectionPinSchema.index({ userId: 1, section: 1 }, { unique: true });

module.exports = mongoose.model('SectionPin', sectionPinSchema);