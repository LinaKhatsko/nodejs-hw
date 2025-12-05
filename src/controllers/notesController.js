import { Note } from '../models/note.js';
import createHttpError from 'http-errors';

// GET /notes (Повертає нотатки ТІЛЬКИ поточного користувача)
export const getAllNotes = async (req, res, next) => {
  try {
    const { page = 1, perPage = 10, tag, search } = req.query;
    const { _id: userId } = req.user; // Отримуємо ID з req.user

    const filter = { userId }; // ОБОВ'ЯЗКОВИЙ ФІЛЬТР: userId
    if (tag) {
      filter.tag = tag;
    }
    if (search) {
      filter.$text = { $search: search };
    }

    const skip = (page - 1) * perPage;

    // Шукаємо документи, які належать цьому userId
    const countPromise = Note.countDocuments(filter);

    const notesPromise = Note.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(perPage);

    const [totalNotes, notes] = await Promise.all([countPromise, notesPromise]);
    const totalPages = Math.ceil(totalNotes / perPage);

    res.status(200).json({
      page: Number(page),
      perPage: Number(perPage),
      totalNotes,
      totalPages,
      notes,
    });
  } catch (err) {
    next(err);
  }
};

// GET /notes/:noteId (Шукає нотатку ТІЛЬКИ поточного користувача)
export const getNoteById = async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const { _id: userId } = req.user;

    // Шукаємо за ID нотатки ТА ID користувача
    const note = await Note.findOne({ _id: noteId, userId });

    if (!note) {
      // 404 - не знайдено (або належить іншому)
      return next(createHttpError(404, 'Note not found'));
    }

    res.status(200).json(note);
  } catch (err) {
    next(err);
  }
};

// POST /notes (Створює нотатку для поточного користувача)
export const createNote = async (req, res, next) => {
  try {
    const { _id: userId } = req.user;

    // Додаємо userId до тіла запиту перед створенням
    const note = await Note.create({
      ...req.body,
      userId,
    });

    res.status(201).json(note);
  } catch (err) {
    next(err);
  }
};

// PATCH /notes/:noteId (Оновлює нотатку ТІЛЬКИ поточного користувача)
export const updateNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const { _id: userId } = req.user;

    // Оновлюємо, шукаючи за ID нотатки ТА ID користувача
    const note = await Note.findOneAndUpdate(
      { _id: noteId, userId }, // Умова пошуку
      req.body, // Дані для оновлення
      {
        new: true,
        runValidators: true,
      },
    );

    if (!note) {
      return next(createHttpError(404, 'Note not found'));
    }

    res.status(200).json(note);
  } catch (err) {
    next(err);
  }
};

// DELETE /notes/:noteId (Видаляє нотатку ТІЛЬКИ поточного користувача)
export const deleteNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const { _id: userId } = req.user;

    // Видаляємо, шукаючи за ID нотатки ТА ID користувача
    const note = await Note.findOneAndDelete({ _id: noteId, userId });

    if (!note) {
      return next(createHttpError(404, 'Note not found'));
    }

    res.status(200).json(note);
  } catch (err) {
    next(err);
  }
};
