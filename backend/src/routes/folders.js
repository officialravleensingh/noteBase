const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getAllFolders,
  createFolder,
  updateFolder,
  deleteFolder
} = require('../controllers/foldersController');

router.use(authenticate);

router.get('/', getAllFolders);
router.post('/', createFolder);
router.put('/:id', updateFolder);
router.delete('/:id', deleteFolder);

module.exports = router;