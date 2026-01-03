const mongoose = require('mongoose');

const sharedNoteSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
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
  expiresAt: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

sharedNoteSchema.index({ expiresAt: 1 });

module.exports = mongoose.model('SharedNote', sharedNoteSchema);