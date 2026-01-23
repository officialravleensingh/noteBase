const SharedNote = require('../models/SharedNote');
const Note = require('../models/Note');
const CollaborationLog = require('../models/CollaborationLog');
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

    const currentNote = sharedNote.noteId;
    const collaboratorIP = req.ip || req.connection.remoteAddress || 'unknown';
    
    // Only log if there are actual changes
    const hasChanges = (title && title !== currentNote.title) || (content && content !== currentNote.content);
    
    if (!hasChanges) {
      return res.json({
        note: {
          _id: currentNote._id,
          title: currentNote.title,
          content: currentNote.content,
          type: currentNote.type,
          createdAt: currentNote.createdAt,
          updatedAt: currentNote.updatedAt
        }
      });
    }
    
    // Log title change if different
    if (title && title !== currentNote.title) {
      await CollaborationLog.create({
        noteId: currentNote._id,
        shareId,
        changeType: 'title',
        oldValue: currentNote.title || '',
        newValue: title,
        collaboratorIP
      });
    }
    
    // Log content change if different
    if (content && content !== currentNote.content) {
      await CollaborationLog.create({
        noteId: currentNote._id,
        shareId,
        changeType: 'content',
        oldValue: currentNote.content || '',
        newValue: content,
        collaboratorIP
      });
    }
    
    const updatedNote = await Note.findByIdAndUpdate(
      currentNote._id,
      { 
        ...(title && { title }),
        ...(content && { content }),
        updatedAt: new Date() 
      },
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

const getActivityLog = async (req, res) => {
  try {
    const { noteId } = req.params;
    
    // Verify note ownership
    const note = await Note.findOne({ _id: noteId, userId: req.user.id });
    if (!note) {
      return res.status(404).json({ error: 'Note not found or access denied' });
    }
    
    const logs = await CollaborationLog.find({ noteId })
      .sort({ timestamp: -1 })
      .limit(50);
    
    res.json({ logs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const revertChange = async (req, res) => {
  try {
    const { logId } = req.params;
    
    if (!logId || !logId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid log ID' });
    }
    
    const log = await CollaborationLog.findById(logId).populate('noteId');
    if (!log) {
      return res.status(404).json({ error: 'Log entry not found' });
    }
    
    // Verify note ownership
    if (log.noteId.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    if (log.isReverted) {
      return res.status(400).json({ error: 'Change already reverted' });
    }
    
    // Revert the change
    const updateData = {};
    if (log.changeType === 'title') {
      updateData.title = log.oldValue;
    } else if (log.changeType === 'content') {
      updateData.content = log.oldValue;
    }
    updateData.updatedAt = new Date();
    
    await Note.findByIdAndUpdate(log.noteId._id, updateData);
    
    // Mark as reverted
    log.isReverted = true;
    await log.save();
    
    res.json({ message: 'Change reverted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createShareLink,
  getSharedNote,
  updateSharedNote,
  getMyShares,
  revokeShare,
  getActivityLog,
  revertChange
};