import createHttpError from 'http-errors';
import { User } from '../models/user.js';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';

// Контролер для PATCH /users/me/avatar
export const updateUserAvatar = async (req, res, next) => {
  try {
    // 1. Перевірка, чи є файл
    if (!req.file) {
      return next(createHttpError(400, 'No file'));
    }

    console.log('✅ File received:', {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });

    // 2. Завантажуємо файл у Cloudinary
    const uploadResult = await saveFileToCloudinary(req.file.buffer);

    // 3. Отримуємо URL
    const avatarUrl = uploadResult.secure_url;

    // 4. Оновлюємо користувача в БД
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: avatarUrl },
      { new: true },
    );

    if (!user) {
      return next(createHttpError(404, 'User not found'));
    }

    // 5. Відповідь
    res.status(200).json({
      url: user.avatar,
    });
  } catch (err) {
    next(err);
  }
};

// Контролер для GET /users/me
export const getCurrentUser = (req, res) => {
  res.status(200).json(req.user);
};
