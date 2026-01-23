const express = require('express');
const router = express.Router();
const { authenticate: auth } = require('../middleware/auth');
const {
  getMemories,
  getMemoryById,
  createMemory,
  updateMemory,
  deleteMemory,
  requestDeleteOTP,
  permanentDelete
} = require('../controllers/memoriesController');

// Get all memories
router.get('/', auth, getMemories);

// Get memory by ID
router.get('/:id', auth, getMemoryById);

// Create memory
router.post('/', auth, createMemory);

// Update memory
router.put('/:id', auth, updateMemory);

// Soft delete memory
router.delete('/:id', auth, deleteMemory);

// Request OTP for permanent deletion
router.post('/:id/request-delete-otp', auth, requestDeleteOTP);

// Permanent delete with OTP
router.delete('/:id/permanent', auth, permanentDelete);

module.exports = router;