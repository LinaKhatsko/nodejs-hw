import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { upload } from '../middleware/multer.js';
import {
  updateUserAvatar,
  getCurrentUser,
} from '../controllers/userController.js';

const router = Router();

// Отримуємо дані поточного користувача
router.get('/users/me', authenticate, getCurrentUser);

// Маршрут для оновлення аватара
router.patch(
  '/users/me/avatar',
  authenticate, // 1. Перевіряємо, чи користувач залогінений
  upload.single('avatar'), // 2. Обробляємо 1 файл з полем 'avatar'
  updateUserAvatar, // 3. Викликаємо контролер
);

export default router;
