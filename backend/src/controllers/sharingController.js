const SharedNote = require('../models/SharedNote');
const Note = require('../models/Note');
const crypto = require('crypto');

const createShareLink = async (req, res) => {
  try {
    const { noteId } = req.params;
    const { permissions = 'view', expiresIn = 7 } = req.body;
    
    const expirationDays = parseInt(expiresIn);
    if (isNaN(expirationDays) || expirationDays < 1 || expirationDays > 3650) {
      return res.status(400).json({ error: 'Expiration must be between 1 and 3650 days' });
    }
    
    const note = await Note.findOne({ _id: noteId, userId: req.user.id });
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    const shareId = crypto.randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000);
    
    const sharedNote = new SharedNote({
      noteId,
      ownerId: req.user.id,
      shareId,
      permissions,
      expiresAt
    });
    
    await sharedNote.save();
    
    const shareUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/shared/${shareId}`;
    
    res.json({
      shareId,
      shareUrl,
      permissions,
      expiresAt,
      expiresInDays: expirationDays
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getSharedNote = async (req, res) => {
  try {
    const { shareId } = req.params;
    
    const sharedNote = await SharedNote.findOne({
      shareId,
      isActive: true,
      expiresAt: { $gt: new Date() }
    }).populate('noteId');
    
    if (!sharedNote) {
      return res.status(404).json({ error: 'Shared note not found or expired' });
    }
    
    sharedNote.accessCount += 1;
    sharedNote.lastAccessedAt = new Date();
    await sharedNote.save();
    
    res.json({
      note: {
        _id: sharedNote.noteId._id,
        title: sharedNote.noteId.title,
        content: sharedNote.noteId.content,
        type: sharedNote.noteId.type,
        createdAt: sharedNote.noteId.createdAt,
        updatedAt: sharedNote.noteId.updatedAt
      },
      permissions: sharedNote.permissions,
      isOwner: false,
      shareId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateSharedNote = async (req, res) => {
  try {
    const { shareId } = req.params;
    const { title, content } = req.body;
    
    const sharedNote = await SharedNote.findOne({
      shareId,
      isActive: true,
      permissions: 'edit',
      expiresAt: { $gt: new Date() }
    }).populate('noteId');
    
    if (!sharedNote) {
      return res.status(404).json({ error: 'Shared note not found or no edit permission' });
    }
    
    const updatedNote = await Note.findByIdAndUpdate(
      sharedNote.noteId._id,
      { title, content, updatedAt: new Date() },
      { new: true }
    );
    
    res.json({
      note: {
        _id: updatedNote._id,
        title: updatedNote.title,
        content: updatedNote.content,
        type: updatedNote.type,
        createdAt: updatedNote.createdAt,
        updatedAt: updatedNote.updatedAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMyShares = async (req, res) => {
  try {
    const shares = await SharedNote.find({
      ownerId: req.user.id,
      isActive: true
    }).populate('noteId', 'title type');
    
    res.json(shares);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const revokeShare = async (req, res) => {
  try {
    const { shareId } = req.params;
    
    const sharedNote = await SharedNote.findOneAndUpdate(
      { shareId, ownerId: req.user.id },
      { isActive: false },
      { new: true }
    );
    
    if (!sharedNote) {
      return res.status(404).json({ error: 'Share not found' });
    }
    
    res.json({ message: 'Share revoked successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createShareLink,
  getSharedNote,
  updateSharedNote,
  getMyShares,
  revokeShare
};