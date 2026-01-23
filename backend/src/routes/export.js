const express = require('express');
const { exportToPDF } = require('../controllers/exportController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/notes/:id/pdf', authenticate, exportToPDF);

module.exports = router;