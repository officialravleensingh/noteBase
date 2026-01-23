const mongoose = require('mongoose');

const memorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['daily', 'special'],
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  mood: {
    type: String,
    enum: ['happy', 'sad', 'excited', 'calm', 'anxious', 'grateful', 'nostalgic', 'content'],
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

memorySchema.index({ userId: 1, date: -1 });
memorySchema.index({ userId: 1, type: 1, date: -1 });
memorySchema.index({ userId: 1, isDeleted: 1 });

module.exports = mongoose.model('Memory', memorySchema);