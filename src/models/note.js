import { Schema, model } from 'mongoose';
import { TAGS } from '../constants/tags.js';

const noteSchema = new Schema(
  {
      userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Посилання на модель User
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: false,
      trim: true,
      default: '',
    },
    tag: {
      type: String,
      // Використовуємо імпортований масив
      enum: TAGS,
      default: 'Todo',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);
// Додаємо текстовий індекс для полів title та content
noteSchema.index({ title: 'text', content: 'text' });

export const Note = model('Note', noteSchema);
