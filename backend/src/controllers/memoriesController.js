const Memory = require('../models/Memory');
const OTP = require('../models/OTP');
const { createOTP, verifyOTP } = require('../utils/otpService');
const { sendEmail } = require('../utils/emailService');

// Get all memories
const getMemories = async (req, res) => {
  try {
    const { type, page = 1, limit = 15, search, sortBy = 'date', order = 'desc' } = req.query;
    const userId = req.user.id;

    const filter = { userId, isDeleted: false };
    if (type) filter.type = type;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions = { [sortBy]: sortOrder };

    const memories = await Memory.find(filter)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Memory.countDocuments(filter);

    res.json({
      memories,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get memory by ID
const getMemoryById = async (req, res) => {
  try {
    const memory = await Memory.findOne({
      _id: req.params.id,
      userId: req.user.id,
      isDeleted: false
    });

    if (!memory) {
      return res.status(404).json({ message: 'Memory not found' });
    }

    res.json(memory);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create memory
const createMemory = async (req, res) => {
  try {
    const { title, content, type, date, tags, mood } = req.body;
    const userId = req.user.id;

    // For daily journal entries, check if one already exists for today
    if (type === 'daily') {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
      
      const existingJournal = await Memory.findOne({
        userId,
        type: 'daily',
        isDeleted: false,
        date: {
          $gte: startOfDay,
          $lt: endOfDay
        }
      });
      
      if (existingJournal) {
        return res.status(400).json({ 
          message: 'Journal entry for today already exists. You can only create one journal entry per day.' 
        });
      }
    }

    const memory = new Memory({
      userId,
      title,
      content,
      type,
      date: date || new Date(),
      tags: tags || [],
      mood
    });

    await memory.save();
    res.status(201).json(memory);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update memory
const updateMemory = async (req, res) => {
  try {
    const { title, content, tags, mood } = req.body;
    
    const memory = await Memory.findOne({
      _id: req.params.id, 
      userId: req.user.id, 
      isDeleted: false
    });

    if (!memory) {
      return res.status(404).json({ message: 'Memory not found' });
    }

    // Check if it's a daily journal entry and if editing is allowed
    if (memory.type === 'daily') {
      const memoryDate = new Date(memory.date);
      const today = new Date();
      
      // Check if the memory was created on a different day
      const isSameDay = memoryDate.getFullYear() === today.getFullYear() &&
                       memoryDate.getMonth() === today.getMonth() &&
                       memoryDate.getDate() === today.getDate();
      
      if (!isSameDay) {
        return res.status(403).json({ 
          message: 'Journal entries can only be edited on the same day they were created.' 
        });
      }
    }

    const updatedMemory = await Memory.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id, isDeleted: false },
      { title, content, tags, mood },
      { new: true }
    );

    res.json(updatedMemory);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Soft delete memory
const deleteMemory = async (req, res) => {
  try {
    const memory = await Memory.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id, isDeleted: false },
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );

    if (!memory) {
      return res.status(404).json({ message: 'Memory not found' });
    }

    res.json({ message: 'Memory moved to recycle bin' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Request OTP for permanent deletion
const requestDeleteOTP = async (req, res) => {
  try {
    const memory = await Memory.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!memory) {
      return res.status(404).json({ message: 'Memory not found' });
    }

    const otpCode = await createOTP(req.user.email, 'memory-delete');

    await sendEmail(req.user.email, 'memory-delete', { 
      name: req.user.name, 
      otp: otpCode,
      memoryTitle: memory.title
    });

    res.json({ message: 'OTP sent to your email' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Permanent delete with OTP
const permanentDelete = async (req, res) => {
  try {
    const { otp } = req.body;

    const isValidOTP = await verifyOTP(req.user.email, otp, 'memory-delete');
    if (!isValidOTP) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const memory = await Memory.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!memory) {
      return res.status(404).json({ message: 'Memory not found' });
    }

    res.json({ message: 'Memory permanently deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getMemories,
  getMemoryById,
  createMemory,
  updateMemory,
  deleteMemory,
  requestDeleteOTP,
  permanentDelete
};