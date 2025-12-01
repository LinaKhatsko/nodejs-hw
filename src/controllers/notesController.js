import { Note } from '../models/note.js';
import createHttpError from 'http-errors';

// Контролер для отримання ВСІХ нотаток
export const getAllNotes = async (req, res, next) => {
  try {
    // Note.find() - шукає всі документи в колекції notes
    const notes = await Note.find();
    res.status(200).json(notes);
  } catch (err) {
    // next(err) - передає помилку далі в глобальний обробник помилок
    next(err);
  }
};

// Контролер для отримання нотатки за ID
export const getNoteById = async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const note = await Note.findById(noteId);

    // Якщо нотатку не знайдено, кидаємо помилку 404
    if (!note) {
      // createHttpError - це той самий http-errors, який ми встановили
      return next(createHttpError(404, 'Note not found'));
    }

    res.status(200).json(note);
  } catch (err) {
    next(err);
  }
};

// Контролер для СТВОРЕННЯ нотатки
export const createNote = async (req, res, next) => {
  try {
    // req.body - це дані, що прийшли у тілі POST-запиту (завдяки express.json())
    const note = await Note.create(req.body);
    // 201 Created - стандартний статус для успішного створення
    res.status(201).json(note);
  } catch (err) {
    next(err);
  }
};

// Контролер для ОНОВЛЕННЯ нотатки
export const updateNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;

    // findByIdAndUpdate шукає за ID та оновлює документ
    const note = await Note.findByIdAndUpdate(noteId, req.body, {
      new: true, // Повертає оновлений документ, а не старий
      runValidators: true, // Застосовує валідацію зі схеми при оновленні
    });

    if (!note) {
      return next(createHttpError(404, 'Note not found'));
    }

    res.status(200).json(note);
  } catch (err) {
    next(err);
  }
};

// Контролер для ВИДАЛЕННЯ нотатки
export const deleteNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const note = await Note.findByIdAndDelete(noteId);

    if (!note) {
      return next(createHttpError(404, 'Note not found'));
    }

    // 200 OK (або 204 No Content, якщо не хочемо повертати тіло)
    res.status(200).json(note);
  } catch (err) {
    next(err);
  }
};
