import { Joi, Segments } from 'celebrate';
import { isValidObjectId } from 'mongoose';
import { TAGS } from '../constants/tags.js';

// Кастомний валідатор для перевірки MongoDB ObjectId
const objectIdValidator = (value, helpers) => {
  if (!isValidObjectId(value)) {
    // Якщо ID невалідний, повертаємо помилку
    return helpers.error('any.invalid', { message: 'Invalid ID format' });
  }
  // Якщо ID валідний, повертаємо його
  return value;
};

// Схема для GET /notes (валідація query-параметрів)
export const getAllNotesSchema = {
  [Segments.QUERY]: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    perPage: Joi.number().integer().min(5).max(20).default(10),
    tag: Joi.string()
      .valid(...TAGS)
      .optional(), // Має бути один із TAGS
    search: Joi.string().allow('').optional(), // Дозволяємо порожній рядок
  }),
};

// Схема для GET /notes/:noteId та DELETE /notes/:noteId
export const noteIdSchema = {
  [Segments.PARAMS]: Joi.object({
    // Використовуємо кастомний валідатор
    noteId: Joi.string().required().custom(objectIdValidator),
  }),
};

// Схема для POST /notes (валідація тіла запиту)
export const createNoteSchema = {
  [Segments.BODY]: Joi.object({
    title: Joi.string().min(1).required(),
    content: Joi.string().allow('').optional(), // Дозволяємо порожній рядок
    tag: Joi.string()
      .valid(...TAGS)
      .optional(), // Має бути один із TAGS
  }),
};

// Схема для PATCH /notes/:noteId (валідація і параметрів, і тіла)
export const updateNoteSchema = {
  // 1. Валідація параметрів (:noteId)
  [Segments.PARAMS]: Joi.object({
    noteId: Joi.string().required().custom(objectIdValidator),
  }),
  // 2. Валідація тіла запиту (body)
  [Segments.BODY]: Joi.object({
    title: Joi.string().min(1).optional(),
    content: Joi.string().allow('').optional(),
    tag: Joi.string()
      .valid(...TAGS)
      .optional(),
  }).or('title', 'content', 'tag'), // Тіло запиту не може бути порожнім
  // .or() вимагає, щоб був присутній *хоча б один* із цих ключів
};
