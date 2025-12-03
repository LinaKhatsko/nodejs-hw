import { Router } from 'express';
import { celebrate } from 'celebrate'; // Імпортуємо celebrate

// Імпортуємо контролери
import {
  getAllNotes,
  getNoteById,
  createNote,
  deleteNote,
  updateNote,
} from '../controllers/notesController.js';

// Імпортуємо схеми валідації
import {
  getAllNotesSchema,
  noteIdSchema,
  createNoteSchema,
  updateNoteSchema,
} from '../validations/notesValidation.js';

const router = Router();

// GET /notes (з валідацією query-параметрів)
router.get('/notes', celebrate(getAllNotesSchema), getAllNotes);

// GET /notes/:noteId (з валідацією ID)
router.get('/notes/:noteId', celebrate(noteIdSchema), getNoteById);

// POST /notes (з валідацією тіла)
router.post('/notes', celebrate(createNoteSchema), createNote);

// DELETE /notes/:noteId (з валідацією ID)
router.delete('/notes/:noteId', celebrate(noteIdSchema), deleteNote);

// PATCH /notes/:noteId (з валідацією ID та тіла)
router.patch('/notes/:noteId', celebrate(updateNoteSchema), updateNote);

export default router;
