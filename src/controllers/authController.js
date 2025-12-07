import handlebars from 'handlebars';
import path from 'node:path';
import fs from 'node:fs/promises';
import { User } from '../models/user.js';
import { Session } from '../models/session.js';
import { createSession, setSessionCookies } from '../services/auth.js';
import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';
import { sendEmail } from '../utils/sendMail.js';
import jwt from 'jsonwebtoken';

// Контролер для POST /auth/register
export const registerUser = async (req, res, next) => {
  try {
    const { email } = req.body;

    // 1. Перевірка, чи існує користувач
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(createHttpError(400, 'Email in use'));
    }

    // 2. Створення користувача (хешування паролю відбувається в pre('save') хуці)
    const user = await User.create(req.body);

    // 3. Створення сесії та встановлення кукі
    const session = await createSession(user._id);
    setSessionCookies(res, session);

    // 4. Відповідь
    res.status(201).json(user); // user.toJSON() автоматично прибере пароль
  } catch (err) {
    next(err);
  }
};

// Контролер для POST /auth/login
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return next(createHttpError(401, 'Invalid email or password'));
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return next(createHttpError(401, 'Invalid email or password'));
    }

    // Оновлення сесії та встановлення кукі
    await Session.deleteOne({ userId: user._id });
    const session = await createSession(user._id);
    setSessionCookies(res, session);

    res.status(200).json({
      status: 200,
      message: 'Successfully logged in a user!',
    });
  } catch (err) {
    next(err);
  }
};

// Контролер для POST /auth/refresh
export const refreshUserSession = async (req, res, next) => {
  try {
    const { sessionId, refreshToken } = req.cookies;

    if (!sessionId || !refreshToken) {
      return next(createHttpError(401, 'Session not found'));
    }

    const session = await Session.findById(sessionId);

    if (!session) {
      return next(createHttpError(401, 'Session not found'));
    }

    if (session.refreshToken !== refreshToken) {
      return next(createHttpError(401, 'Invalid refresh token'));
    }

    if (new Date() > session.refreshTokenValidUntil) {
      return next(createHttpError(401, 'Refresh token expired'));
    }

    // Оновлення сесії та встановлення кукі
    await Session.deleteOne({ _id: sessionId });
    const newSession = await createSession(session.userId);
    setSessionCookies(res, newSession);

    res.status(200).json({ message: 'Session refreshed' });
  } catch (err) {
    next(err);
  }
};

// Контролер для POST /auth/logout
export const logoutUser = async (req, res, next) => {
  try {
    const { sessionId } = req.cookies;

    // 1. Видаляємо сесію, якщо вона є
    if (sessionId) {
      await Session.findByIdAndDelete(sessionId);
    }

    // 2. Очищаємо кукі
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.clearCookie('sessionId');

    // 3. Відповідь (204 No Content - успішно, але без тіла)
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

// POST /auth/request-reset-email
export const requestResetEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    // 1. Якщо користувача немає - повертаємо 200
    if (!user) {
      return res.status(200).json({
        message: 'Password reset email sent successfully',
      });
    }

    // 2. Створюємо JWT токен для скидання (15 хв)
    const token = jwt.sign(
      {
        sub: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: '15m' },
    );

    // 3. Створюємо посилання для фронтенду
    const resetLink = `${process.env.FRONTEND_DOMAIN}/reset-password?token=${token}`;

    // 4. Формуємо лист зі скидання пароля
    //  Формуємо шлях до шаблона
    const templatePath = path.resolve('src/templates/reset-password-email.html');
    // Читаємо шаблон
    const templateSource = await fs.readFile(templatePath, 'utf-8');
    // Готуємо шаблон до заповнення
    const template = handlebars.compile(templateSource);
    // Формуємо із шаблона HTML документ з динамічними даними
    const html = template({
      name: user.username,
      link: resetLink,
    });


    // 5. Відправляємо лист (шаблон src/templates/reset-password-email.html)
    await sendEmail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Reset your password',
      html,
    });

    // 6. Відповідь (завжди однакова для безпеки)
    res.status(200).json({
      message: 'Password reset email sent successfully',
    });
  } catch (err) {
    console.error('❌ Error in requestResetEmail:', err);
    // Якщо sendEmail кинув помилку
    if (err.message && err.message.includes('Failed to send')) {
      return next(createHttpError(500, err.message));
    }
    next(err);
  }
};

// POST /auth/reset-password
export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    let payload;

    // 1. Верифікуємо токен
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return next(createHttpError(401, 'Invalid or expired token'));
    }

    // 2. Шукаємо користувача за даними з токена
    const user = await User.findOne({
      _id: payload.sub,
      email: payload.email,
    });

    if (!user) {
      return next(createHttpError(404, 'User not found'));
    }

    // 3. Оновлюємо пароль
    // Ми не хешуємо пароль тут, бо хук pre('save') зробить це
    // Нам потрібно лише змінити пароль і викликати .save()
    user.password = password;
    await user.save(); // Це запустить хук pre('save')

    // 4. Відповідь
    res.status(200).json({
      message: 'Password reset successfully',
    });
  } catch (err) {
    next(err);
  }
};
