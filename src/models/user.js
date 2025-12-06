import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new Schema(
  {
    username: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, // email має бути унікальним
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8, // мінімальна довжина паролю
    },
    avatar: {
      type: String,
      default: 'https://ac.goit.global/fullstack/react/default-avatar.jpg',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Хук pre('save') для хешування паролю перед збереженням
// Використовуємо function, щоб мати доступ до 'this'
userSchema.pre('save', async function (next) {
  // Встановлюємо username = email, якщо username не надано
  if (!this.username) {
    this.username = this.email;
  }

  // Хешуємо пароль, тільки якщо він був змінений (або новий)
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Метод toJSON для видалення пароля з відповіді
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password; // Видаляємо пароль
  return obj;
};

export const User = model('User', userSchema);
