import { Schema, model } from 'mongoose';

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
      // enum - це перелік допустимих значень для цього поля
      enum: [
        'Work',
        'Personal',
        'Meeting',
        'Shopping',
        'Ideas',
        'Travel',
        'Finance',
        'Health',
        'Important',
        'Todo',
      ],
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

// Створюємо та експортуємо модель 'Note'
export const Note = model('Note', noteSchema);
