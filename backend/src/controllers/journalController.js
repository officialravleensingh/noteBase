const JournalEntry = require('../models/JournalEntry');
const OTP = require('../models/OTP');
const { sendEmail } = require('../utils/emailService');

// Get journal entries
const getJournalEntries = async (req, res) => {
  try {
    const { page = 1, limit = 15, search, month, year } = req.query;
    const userId = req.user.id;

    const filter = { userId, isDeleted: false };
    
    if (search) {
      filter.$or = [
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      filter.date = { $gte: startDate, $lte: endDate };
    }

    const entries = await JournalEntry.find(filter)
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await JournalEntry.countDocuments(filter);

    res.json({
      entries,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create journal entry
const createJournalEntry = async (req, res) => {
  try {
    const { content, mood, weather, tags, template, date } = req.body;
    const userId = req.user.id;
    
    const entryDate = date ? new Date(date) : new Date();
    entryDate.setHours(0, 0, 0, 0);
    
    // Check if entry for this date already exists
    const existingEntry = await JournalEntry.findOne({
      userId,
      date: entryDate,
      isDeleted: false
    });
    
    if (existingEntry) {
      return res.status(400).json({ message: 'Journal entry for this date already exists' });
    }
    
    const entry = new JournalEntry({
      userId,
      date: entryDate,
      content,
      mood,
      weather,
      tags,
      template
    });
    
    await entry.save();
    res.status(201).json({ entry });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get or create today's journal entry
const getTodayEntry = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let entry = await JournalEntry.findOne({
      userId,
      date: today,
      isDeleted: false
    });

    if (!entry) {
      entry = new JournalEntry({
        userId,
        date: today,
        content: ''
      });
      await entry.save();
    }

    res.json(entry);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get journal entry by date
const getEntryByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const userId = req.user.id;
    
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    let entry = await JournalEntry.findOne({
      userId,
      date: targetDate,
      isDeleted: false
    });

    if (!entry) {
      entry = new JournalEntry({
        userId,
        date: targetDate,
        content: ''
      });
      await entry.save();
    }

    res.json(entry);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update journal entry
const updateJournalEntry = async (req, res) => {
  try {
    const { content, mood, weather, tags, template } = req.body;
    
    const entry = await JournalEntry.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id, isDeleted: false },
      { content, mood, weather, tags, template },
      { new: true }
    );

    if (!entry) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }

    res.json(entry);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Soft delete journal entry
const deleteJournalEntry = async (req, res) => {
  try {
    const entry = await JournalEntry.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id, isDeleted: false },
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );

    if (!entry) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }

    res.json({ message: 'Journal entry moved to recycle bin' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Request OTP for permanent deletion
const requestDeleteOTP = async (req, res) => {
  try {
    const entry = await JournalEntry.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!entry) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }

    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
    
    await OTP.create({
      email: req.user.email,
      otp: otpCode,
      type: 'journal-delete',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });

    await sendEmail(req.user.email, 'journal-delete', { 
      name: req.user.name, 
      otp: otpCode,
      entryDate: entry.date.toDateString()
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

    const otpRecord = await OTP.findOne({
      email: req.user.email,
      otp,
      type: 'journal-delete',
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const entry = await JournalEntry.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!entry) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }

    await OTP.deleteOne({ _id: otpRecord._id });
    res.json({ message: 'Journal entry permanently deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getJournalEntries,
  createJournalEntry,
  getTodayEntry,
  getEntryByDate,
  updateJournalEntry,
  deleteJournalEntry,
  requestDeleteOTP,
  permanentDelete
};