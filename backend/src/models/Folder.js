const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

folderSchema.index({ userId: 1 });

module.exports = mongoose.model('Folder', folderSchema);