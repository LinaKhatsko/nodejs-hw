import { Schema, model } from 'mongoose';
import { TAGS } from '../constants/tags.js';

// Описуємо схему (структуру) нашої нотатки
const noteSchema = new Schema(
  {
    title: {
      type: String,
      required: true, // Поле є обов'язковим
      trim: true, // Прибирає зайві пробіли на початку та в кінці
    },
    content: {
      type: String,
      required: false, // Поле не є обов'язковим
      trim: true,
      default: '', // Значення за замовчуванням, якщо нічого не передано
    },
    tag: {
      type: String,
   // Використовуємо імпортований масив
      enum: TAGS,
      default: 'Todo', // Значення за замовчуванням
    },
  },
  {
    // timestamps: true автоматично додає поля createdAt та updatedAt
    timestamps: true,
    // versionKey: false прибирає поле __v, яке Mongoose додає за замовчуванням
    versionKey: false,
  },
);

// Додаємо текстовий індекс для полів title та content
noteSchema.index({ title: 'text', content: 'text' });

// Створюємо та експортуємо модель 'Note'
export const Note = model('Note', noteSchema, 'Note');
