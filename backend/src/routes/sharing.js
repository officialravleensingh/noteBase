const express = require('express');
const { 
  createShareLink, 
  getSharedNote, 
  updateSharedNote, 
  getMyShares, 
  revokeShare,
  getActivityLog,
  revertChange
} = require('../controllers/sharingController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/notes/:noteId/share', authenticate, createShareLink);
router.get('/shared/:shareId', getSharedNote);
router.put('/shared/:shareId', updateSharedNote);
router.get('/my-shares', authenticate, getMyShares);
router.delete('/shares/:shareId', authenticate, revokeShare);
router.get('/notes/:noteId/activity-log', authenticate, getActivityLog);
router.post('/revert/:logId', authenticate, revertChange);

module.exports = router;