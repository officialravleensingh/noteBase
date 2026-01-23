const express = require('express');
const { 
  createShareLink, 
  getSharedNote, 
  updateSharedNote, 
  getMyShares, 
  revokeShare 
} = require('../controllers/sharingController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/notes/:noteId/share', authenticate, createShareLink);
router.get('/shared/:shareId', getSharedNote);
router.put('/shared/:shareId', updateSharedNote);
router.get('/my-shares', authenticate, getMyShares);
router.delete('/shares/:shareId', authenticate, revokeShare);

module.exports = router;