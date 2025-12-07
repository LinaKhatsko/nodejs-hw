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
router.use('/notes', authenticate);

// GET
router.get('/notes', celebrate(getAllNotesSchema), getAllNotes);

// GET /:noteId
router.get('/notes/:noteId', celebrate(noteIdSchema), getNoteById);

// POST /
router.post('/notes/', celebrate(createNoteSchema), createNote);

// DELETE /:noteId
router.delete('/notes/:noteId', celebrate(noteIdSchema), deleteNote);

// PATCH /:noteId
router.patch('/notes/:noteId', celebrate(updateNoteSchema), updateNote);

export default router;
