const express = require('express');
const router = express.Router();
const { authenticate: auth } = require('../middleware/auth');
const {
  getDeletedItems,
  restoreItem,
  requestPermanentDeleteOTP,
  permanentDelete,
  emptyRecycleBin,
  requestEmptyBinOTP
} = require('../controllers/recycleBinController');

// Get all deleted items
router.get('/', auth, getDeletedItems);

// Restore item
router.post('/:id/restore', auth, restoreItem);

// Request OTP for permanent deletion
router.post('/:id/request-delete-otp', auth, requestPermanentDeleteOTP);

// Permanent delete with OTP
router.delete('/:id/permanent', auth, permanentDelete);

// Request OTP for emptying recycle bin
router.post('/empty/request-otp', auth, requestEmptyBinOTP);

// Empty recycle bin with OTP
router.delete('/empty', auth, emptyRecycleBin);

module.exports = router;