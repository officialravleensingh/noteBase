const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    enum: ['normal', 'journal', 'memory'],
    default: 'normal'
  },
  folderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder',
    default: null
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Note locking fields
  isLocked: {
    type: Boolean,
    default: false
  },
  lockPin: {
    type: String,
    default: null
  },
  lockCreatedAt: {
    type: Date,
    default: null
  },
  lastModified: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

noteSchema.index({ userId: 1 });
noteSchema.index({ createdAt: 1 });
noteSchema.index({ updatedAt: 1 });
noteSchema.index({ title: 'text', content: 'text' });
noteSchema.index({ isLocked: 1 });

module.exports = mongoose.model('Note', noteSchema);