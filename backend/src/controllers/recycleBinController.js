const RecycleBin = require('../models/RecycleBin');
const Note = require('../models/Note');
const Folder = require('../models/Folder');
const Memory = require('../models/Memory');
const JournalEntry = require('../models/JournalEntry');
const OTP = require('../models/OTP');
const { createOTP, verifyOTP } = require('../utils/otpService');
const { sendEmail } = require('../utils/emailService');

// Get all deleted items
const getDeletedItems = async (req, res) => {
  try {
    const { type, page = 1, limit = 15 } = req.query;
    const userId = req.user.id;

    const filter = { userId };
    if (type) filter.itemType = type;

    const items = await RecycleBin.find(filter)
      .sort({ deletedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await RecycleBin.countDocuments(filter);

    res.json({
      items,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Restore item from recycle bin
const restoreItem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const recycleBinItem = await RecycleBin.findOne({ _id: id, userId });
    if (!recycleBinItem) {
      return res.status(404).json({ message: 'Item not found in recycle bin' });
    }

    const { itemType, originalData } = recycleBinItem;
    let restoredItem;

    // Restore based on item type
    switch (itemType) {
      case 'note':
        restoredItem = new Note({
          ...originalData,
          isDeleted: false,
          deletedAt: null
        });
        await restoredItem.save();
        break;

      case 'folder':
        restoredItem = new Folder({
          ...originalData,
          isDeleted: false,
          deletedAt: null
        });
        await restoredItem.save();
        break;

      case 'memory':
        restoredItem = new Memory({
          ...originalData,
          isDeleted: false,
          deletedAt: null
        });
        await restoredItem.save();
        break;

      case 'journal':
        restoredItem = new JournalEntry({
          ...originalData,
          isDeleted: false,
          deletedAt: null
        });
        await restoredItem.save();
        break;

      default:
        return res.status(400).json({ message: 'Invalid item type' });
    }

    // Remove from recycle bin
    await RecycleBin.deleteOne({ _id: id });

    res.json({ 
      message: `${itemType.charAt(0).toUpperCase() + itemType.slice(1)} restored successfully`,
      item: restoredItem
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Request OTP for permanent deletion
const requestPermanentDeleteOTP = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const recycleBinItem = await RecycleBin.findOne({ _id: id, userId });
    if (!recycleBinItem) {
      return res.status(404).json({ message: 'Item not found in recycle bin' });
    }

    const otpCode = await createOTP(req.user.email, 'permanent-delete');

    await sendEmail(req.user.email, 'permanent-delete', { 
      name: req.user.name, 
      otp: otpCode,
      itemType: recycleBinItem.itemType,
      itemTitle: recycleBinItem.originalData.title || recycleBinItem.originalData.name || 'Untitled'
    });

    res.json({ message: 'OTP sent to your email' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Permanent delete with OTP
const permanentDelete = async (req, res) => {
  try {
    const { id } = req.params;
    const { otp } = req.body;
    const userId = req.user.id;

    const isValidOTP = await verifyOTP(req.user.email, otp, 'permanent-delete');
    if (!isValidOTP) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const recycleBinItem = await RecycleBin.findOneAndDelete({ _id: id, userId });
    if (!recycleBinItem) {
      return res.status(404).json({ message: 'Item not found in recycle bin' });
    }

    res.json({ 
      message: `${recycleBinItem.itemType.charAt(0).toUpperCase() + recycleBinItem.itemType.slice(1)} permanently deleted`
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Empty entire recycle bin (with OTP)
const emptyRecycleBin = async (req, res) => {
  try {
    const { otp } = req.body;
    const userId = req.user.id;

    const isValidOTP = await verifyOTP(req.user.email, otp, 'empty-recycle-bin');
    if (!isValidOTP) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const result = await RecycleBin.deleteMany({ userId });

    res.json({ 
      message: `Recycle bin emptied. ${result.deletedCount} items permanently deleted.`
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Request OTP for emptying recycle bin
const requestEmptyBinOTP = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const itemCount = await RecycleBin.countDocuments({ userId });
    if (itemCount === 0) {
      return res.status(400).json({ message: 'Recycle bin is already empty' });
    }

    const otpCode = await createOTP(req.user.email, 'empty-recycle-bin');

    await sendEmail(req.user.email, 'empty-recycle-bin', { 
      name: req.user.name, 
      otp: otpCode,
      itemCount
    });

    res.json({ message: 'OTP sent to your email' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getDeletedItems,
  restoreItem,
  requestPermanentDeleteOTP,
  permanentDelete,
  emptyRecycleBin,
  requestEmptyBinOTP
};