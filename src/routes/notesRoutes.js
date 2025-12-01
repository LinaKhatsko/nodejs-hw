import { Router } from 'express';
// Імпортуємо всі наші контролери
import {
  getAllNotes,
  getNoteById,
  createNote,
  deleteNote,
  updateNote,
} from '../controllers/notesController.js';

const router = Router();

// Зверніть увагу, ми вказуємо повний шлях сюди
// GET /notes - Отримати всі нотатки
router.get('/notes', getAllNotes);

// GET /notes/:noteId - Отримати одну нотатку
router.get('/notes/:noteId', getNoteById);

// POST /notes - Створити нотатку
router.post('/notes', createNote);

// DELETE /notes/:noteId - Видалити нотатку
router.delete('/notes/:noteId', deleteNote);

// PATCH /notes/:noteId - Оновити нотатку
router.patch('/notes/:noteId', updateNote);

export default router;
