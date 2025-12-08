const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  generatePDF,
  generateShareableLink,
  getSharedNote
} = require('../controllers/exportController');

router.get('/notes/:id/pdf', authenticate, generatePDF);
router.post('/notes/:id/share', authenticate, generateShareableLink);
router.get('/shared/:shareId', getSharedNote);

module.exports = router;