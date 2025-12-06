import { Router } from 'express';
import { celebrate } from 'celebrate';
import {
  getAllNotes,
  getNoteById,
  createNote,
  deleteNote,
  updateNote,
} from '../controllers/notesController.js';
import {
  getAllNotesSchema,
  noteIdSchema,
  createNoteSchema,
  updateNoteSchema,
} from '../validations/notesValidation.js';
// Імпортуємо наш новий middleware
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

// Застосовуємо 'authenticate' до ВСІХ маршрутів нотаток
router.use(authenticate);

// GET
router.get('/', celebrate(getAllNotesSchema), getAllNotes);

// GET /:noteId
router.get('/:noteId', celebrate(noteIdSchema), getNoteById);

// POST /
router.post('/', celebrate(createNoteSchema), createNote);

// DELETE /:noteId
router.delete('/:noteId', celebrate(noteIdSchema), deleteNote);

// PATCH /:noteId
router.patch('/:noteId', celebrate(updateNoteSchema), updateNote);

export default router;
