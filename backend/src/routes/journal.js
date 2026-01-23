const express = require('express');
const router = express.Router();
const { authenticate: auth } = require('../middleware/auth');
const {
  getJournalEntries,
  createJournalEntry,
  getTodayEntry,
  getEntryByDate,
  updateJournalEntry,
  deleteJournalEntry,
  requestDeleteOTP,
  permanentDelete
} = require('../controllers/journalController');

// Get all journal entries
router.get('/', auth, getJournalEntries);

// Create journal entry
router.post('/', auth, createJournalEntry);

// Get today's journal entry
router.get('/today', auth, getTodayEntry);

// Get journal entry by date
router.get('/date/:date', auth, getEntryByDate);

// Update journal entry
router.put('/:id', auth, updateJournalEntry);

// Soft delete journal entry
router.delete('/:id', auth, deleteJournalEntry);

// Request OTP for permanent deletion
router.post('/:id/request-delete-otp', auth, requestDeleteOTP);

// Permanent delete with OTP
router.delete('/:id/permanent', auth, permanentDelete);

module.exports = router;