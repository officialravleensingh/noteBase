const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getAllNotes,
  createNote,
  updateNote,
  deleteNote,
  getNoteById,
  lockNote,
  unlockNote,
  requestUnlockOTP,
  verifyUnlockOTP
} = require('../controllers/notesController');

router.use(authenticate);

router.get('/', getAllNotes);
router.post('/', createNote);
router.get('/:id', getNoteById);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);

// Note locking routes
router.post('/:id/lock', lockNote);
router.post('/:id/unlock', unlockNote);
router.post('/:id/request-unlock-otp', requestUnlockOTP);
router.post('/:id/verify-unlock-otp', verifyUnlockOTP);

module.exports = router;