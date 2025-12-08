const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getAllNotes,
  createNote,
  updateNote,
  deleteNote,
  getNoteById
} = require('../controllers/notesController');

router.use(authenticate);

router.get('/', getAllNotes);
router.post('/', createNote);
router.get('/:id', getNoteById);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);

module.exports = router;