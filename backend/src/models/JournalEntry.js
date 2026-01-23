const mongoose = require('mongoose');

const journalEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  content: {
    type: String,
    default: ''
  },
  mood: {
    type: String,
    enum: ['happy', 'sad', 'excited', 'calm', 'anxious', 'grateful', 'nostalgic', 'content'],
    default: null
  },
  weather: {
    type: String,
    default: null
  },
  tags: [{
    type: String,
    trim: true
  }],
  template: {
    type: String,
    default: null
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

journalEntrySchema.index({ userId: 1, date: -1 }, { unique: true });
journalEntrySchema.index({ userId: 1, isDeleted: 1 });

module.exports = mongoose.model('JournalEntry', journalEntrySchema);