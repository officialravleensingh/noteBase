const express = require('express');
const router = express.Router();
const { setPin, verifyPin, checkPin, removePin } = require('../controllers/pinController');
const { authenticate } = require('../middleware/auth');

// All PIN routes require authentication
router.use(authenticate);

// Set PIN for a section
router.post('/set', setPin);

// Verify PIN for section access
router.post('/verify', verifyPin);

// Check if PIN exists for section
router.get('/check/:section', checkPin);

// Remove PIN for section
router.delete('/remove', removePin);

module.exports = router;