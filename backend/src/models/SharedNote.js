const mongoose = require('mongoose');

const sharedNoteSchema = new mongoose.Schema({
  noteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Note',
    required: true
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  shareId: {
    type: String,
    unique: true,
    required: true
  },
  permissions: {
    type: String,
    enum: ['view', 'edit'],
    default: 'view'
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    validate: {
      validator: function(value) {
        const now = new Date();
        const maxExpiry = new Date(now.getTime() + 3650 * 24 * 60 * 60 * 1000);
        return value > now && value <= maxExpiry;
      },
      message: 'Expiration date must be between now and 10 years from now'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  accessCount: {
    type: Number,
    default: 0
  },
  lastAccessedAt: Date
}, {
  timestamps: true
});

sharedNoteSchema.index({ shareId: 1 });
sharedNoteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
sharedNoteSchema.index({ ownerId: 1, isActive: 1 });

module.exports = mongoose.model('SharedNote', sharedNoteSchema);