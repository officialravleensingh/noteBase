const mongoose = require('mongoose');

const collaborationLogSchema = new mongoose.Schema({
  noteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Note',
    required: true
  },
  shareId: {
    type: String,
    required: true
  },
  changeType: {
    type: String,
    enum: ['title', 'content'],
    required: true
  },
  oldValue: {
    type: String,
    required: true
  },
  newValue: {
    type: String,
    required: true
  },
  collaboratorIP: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  isReverted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

collaborationLogSchema.index({ noteId: 1, timestamp: -1 });
collaborationLogSchema.index({ shareId: 1 });

module.exports = mongoose.model('CollaborationLog', collaborationLogSchema);