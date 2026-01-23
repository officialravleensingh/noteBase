const Note = require('../models/Note');
const Folder = require('../models/Folder');
const RecycleBin = require('../models/RecycleBin');
const NoteLockOTP = require('../models/NoteLockOTP');
const { hashPassword, comparePassword } = require('../utils/bcrypt');
const { createOTP } = require('../utils/otpService');
const { sendOTPEmail } = require('../utils/emailService');
const User = require('../models/User');

const getAllNotes = async (req, res) => {
  try {
    const { 
      sortBy = 'updatedAt', 
      order = 'desc', 
      folderId, 
      noFolder, 
      page = 1, 
      limit = 10, 
      search = '' 
    } = req.query;
    const userId = req.user.id;

    const validSortFields = ['updatedAt', 'createdAt', 'title'];
    const validOrders = ['asc', 'desc'];
    
    if (!validSortFields.includes(sortBy)) {
      return res.status(400).json({ success: false, message: 'Invalid sort field' });
    }
    
    if (!validOrders.includes(order)) {
      return res.status(400).json({ success: false, message: 'Invalid sort order' });
    }

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));

    const whereClause = { userId };
    
    if (folderId) {
      whereClause.folderId = folderId;
    } else if (noFolder === 'true') {
      whereClause.folderId = null;
    }

    if (search && search.trim()) {
      const searchTerm = search.trim();
      whereClause.$or = [
        { title: { $regex: searchTerm, $options: 'i' } },
        { content: { $regex: searchTerm, $options: 'i' } }
      ];
    }

    const skip = (pageNum - 1) * limitNum;
    const sortOrder = order === 'desc' ? -1 : 1;

    const [notes, total] = await Promise.all([
      Note.find(whereClause)
        .populate('folderId', 'name')
        .select('title content type createdAt updatedAt folderId')
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limitNum),
      Note.countDocuments(whereClause)
    ]);

    res.json({ 
      success: true, 
      notes, 
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch notes' });
  }
};

const createNote = async (req, res) => {
  try {
    const { title, content, folderId, type = 'normal' } = req.body;
    const userId = req.user.id;

    if (title && title.length > 200) {
      return res.status(400).json({ success: false, message: 'Title must be less than 200 characters' });
    }

    if (content && content.length > 50000) {
      return res.status(400).json({ success: false, message: 'Content must be less than 50,000 characters' });
    }

    if (folderId) {
      const folder = await Folder.findOne({ _id: folderId, userId });
      if (!folder) {
        return res.status(400).json({ success: false, message: 'Invalid folder' });
      }
    }

    let noteTitle = title?.trim();
    
    if (type === 'journal') {
      const today = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      const existingJournal = await Note.findOne({
        userId,
        type: 'journal',
        createdAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lt: new Date(new Date().setHours(23, 59, 59, 999))
        }
      });
      
      if (existingJournal) {
        return res.status(400).json({ 
          success: false, 
          message: 'Journal entry for today already exists' 
        });
      }
      
      noteTitle = `Journal - ${today}`;
    } else if (type === 'memory') {
      if (!noteTitle) {
        // Generate unique Memory title
        const existingMemories = await Note.find({
          userId,
          type: 'memory',
          title: { $regex: /^Memory( \d+)?$/ }
        }).select('title');
        
        if (existingMemories.length === 0) {
          noteTitle = 'Memory';
        } else {
          const numbers = existingMemories
            .map(note => {
              if (note.title === 'Memory') return 0;
              const match = note.title.match(/^Memory (\d+)$/);
              return match ? parseInt(match[1]) : -1;
            })
            .filter(num => num >= 0)
            .sort((a, b) => a - b);
          
          let nextNumber = 2;
          for (const num of numbers) {
            if (num === 0) continue;
            if (num === nextNumber) {
              nextNumber++;
            } else {
              break;
            }
          }
          
          noteTitle = `Memory ${nextNumber}`;
        }
      }
    } else {
      if (!noteTitle) {
        // Generate unique Untitled title
        const existingNotes = await Note.find({
          userId,
          title: { $regex: /^Untitled( \d+)?$/ }
        }).select('title');
        
        if (existingNotes.length === 0) {
          noteTitle = 'Untitled';
        } else {
          const numbers = existingNotes
            .map(note => {
              if (note.title === 'Untitled') return 0;
              const match = note.title.match(/^Untitled (\d+)$/);
              return match ? parseInt(match[1]) : -1;
            })
            .filter(num => num >= 0)
            .sort((a, b) => a - b);
          
          let nextNumber = 2;
          for (const num of numbers) {
            if (num === 0) continue;
            if (num === nextNumber) {
              nextNumber++;
            } else {
              break;
            }
          }
          
          noteTitle = `Untitled ${nextNumber}`;
        }
      }
    }

    if (type !== 'journal') {
      const existingNote = await Note.findOne({ userId, title: noteTitle });
      if (existingNote) {
        return res.status(400).json({ 
          success: false, 
          message: 'A note with this title already exists. Please choose a different title.' 
        });
      }
    }

    const note = new Note({
      title: noteTitle,
      content: content?.trim() || '',
      type,
      userId,
      folderId: folderId || null
    });

    await note.save();
    await note.populate('folderId', 'name');

    res.status(201).json({ success: true, note });
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ success: false, message: 'Failed to create note' });
  }
};

const updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, folderId } = req.body;
    const userId = req.user.id;

    if (!id) {
      return res.status(400).json({ success: false, message: 'Note ID is required' });
    }

    if (title && title.length > 200) {
      return res.status(400).json({ success: false, message: 'Title must be less than 200 characters' });
    }

    if (content && content.length > 50000) {
      return res.status(400).json({ success: false, message: 'Content must be less than 50,000 characters' });
    }

    if (folderId) {
      const folder = await Folder.findOne({ _id: folderId, userId });
      if (!folder) {
        return res.status(400).json({ success: false, message: 'Invalid folder' });
      }
    }

    const existingNote = await Note.findOne({ _id: id, userId });
    if (!existingNote) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    if (existingNote.isLocked) {
      return res.status(403).json({ success: false, message: 'Note is locked. Please unlock it first.' });
    }

    const updateData = {
      lastModified: new Date()
    };
    if (title !== undefined) updateData.title = title.trim();
    if (content !== undefined) updateData.content = content.trim();
    if (folderId !== undefined) updateData.folderId = folderId || null;

    const note = await Note.findOneAndUpdate(
      { _id: id, userId },
      updateData,
      { new: true }
    ).populate('folderId', 'name');

    res.json({ success: true, note });
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ success: false, message: 'Failed to update note' });
  }
};

const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!id) {
      return res.status(400).json({ success: false, message: 'Note ID is required' });
    }

    const existingNote = await Note.findOne({ _id: id, userId });
    if (!existingNote) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    await RecycleBin.create({
      userId,
      itemType: 'note',
      itemId: existingNote._id,
      originalData: existingNote.toObject()
    });

    await Note.findOneAndDelete({ _id: id, userId });

    res.json({ success: true, message: 'Note moved to recycle bin' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete note' });
  }
};

const getNoteById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!id) {
      return res.status(400).json({ success: false, message: 'Note ID is required' });
    }

    const note = await Note.findOne({ _id: id, userId })
      .populate('folderId', 'name')
      .select('title content type createdAt updatedAt folderId isLocked lockCreatedAt lastModified');

    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    if (note.isLocked) {
      return res.json({ 
        success: true, 
        note: {
          _id: note._id,
          title: note.title,
          type: note.type,
          isLocked: true,
          lockCreatedAt: note.lockCreatedAt,
          createdAt: note.createdAt,
          updatedAt: note.updatedAt,
          folderId: note.folderId
        }
      });
    }

    res.json({ success: true, note });
  } catch (error) {
    console.error('Get note error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch note' });
  }
};

const lockNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { pin } = req.body;
    const userId = req.user.id;

    if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      return res.status(400).json({ success: false, message: 'PIN must be exactly 4 digits' });
    }

    const note = await Note.findOne({ _id: id, userId });
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    if (note.isLocked) {
      return res.status(400).json({ success: false, message: 'Note is already locked' });
    }

    const hashedPin = await hashPassword(pin);
    
    await Note.findOneAndUpdate(
      { _id: id, userId },
      {
        isLocked: true,
        lockPin: hashedPin,
        lockCreatedAt: new Date()
      }
    );

    res.json({ success: true, message: 'Note locked successfully' });
  } catch (error) {
    console.error('Lock note error:', error);
    res.status(500).json({ success: false, message: 'Failed to lock note' });
  }
};

const unlockNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { pin } = req.body;
    const userId = req.user.id;

    if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      return res.status(400).json({ success: false, message: 'PIN must be exactly 4 digits' });
    }

    const note = await Note.findOne({ _id: id, userId });
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    if (!note.isLocked) {
      return res.status(400).json({ success: false, message: 'Note is not locked' });
    }

    const isValidPin = await comparePassword(pin, note.lockPin);
    if (!isValidPin) {
      return res.status(400).json({ success: false, message: 'Invalid PIN' });
    }

    await Note.findOneAndUpdate(
      { _id: id, userId },
      {
        isLocked: false,
        lockPin: null,
        lockCreatedAt: null
      }
    );

    res.json({ success: true, message: 'Note unlocked successfully' });
  } catch (error) {
    console.error('Unlock note error:', error);
    res.status(500).json({ success: false, message: 'Failed to unlock note' });
  }
};

const requestUnlockOTP = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const note = await Note.findOne({ _id: id, userId });
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    if (!note.isLocked) {
      return res.status(400).json({ success: false, message: 'Note is not locked' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const otp = await createOTP(user.email, 'note-unlock');

    const emailSent = await sendOTPEmail(user.email, otp, 'note-unlock');
    if (!emailSent) {
      return res.status(500).json({ success: false, message: 'Failed to send OTP email' });
    }

    res.json({ success: true, message: 'OTP sent to your email' });
  } catch (error) {
    console.error('Request unlock OTP error:', error);
    res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
};

const verifyUnlockOTP = async (req, res) => {
  try {
    const { id } = req.params;
    const { otp } = req.body;
    const userId = req.user.id;

    if (!otp || otp.length !== 6) {
      return res.status(400).json({ success: false, message: 'OTP must be 6 digits' });
    }

    const note = await Note.findOne({ _id: id, userId });
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    if (!note.isLocked) {
      return res.status(400).json({ success: false, message: 'Note is not locked' });
    }

    const otpRecord = await NoteLockOTP.findOne({
      noteId: id,
      userId,
      otp,
      purpose: 'unlock',
      isUsed: false,
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    await NoteLockOTP.findByIdAndUpdate(otpRecord._id, { isUsed: true });

    await Note.findOneAndUpdate(
      { _id: id, userId },
      {
        isLocked: false,
        lockPin: null,
        lockCreatedAt: null
      }
    );

    res.json({ success: true, message: 'Note unlocked successfully' });
  } catch (error) {
    console.error('Verify unlock OTP error:', error);
    res.status(500).json({ success: false, message: 'Failed to verify OTP' });
  }
};

module.exports = {
  getAllNotes,
  createNote,
  updateNote,
  deleteNote,
  getNoteById,
  lockNote,
  unlockNote,
  requestUnlockOTP,
  verifyUnlockOTP
};