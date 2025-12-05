import { User } from '../models/user.js';
import { Session } from '../models/session.js';
import { createSession, setSessionCookies } from '../services/auth.js';
import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';

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

    // 1. Пошук користувача
    const user = await User.findOne({ email });
    if (!user) {
      return next(createHttpError(401, 'Invalid credentials'));
    }

    // 2. Перевірка паролю
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return next(createHttpError(401, 'Invalid credentials'));
    }

    // 3. Видаляємо стару сесію та створюємо нову
    await Session.deleteMany({ userId: user._id });
    const session = await createSession(user._id);
    setSessionCookies(res, session);

    // 4. Відповідь
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

// Контролер для POST /auth/refresh
export const refreshUserSession = async (req, res, next) => {
  try {
    const { refreshToken, sessionId } = req.cookies;

    // 1. Пошук сесії
    const session = await Session.findOne({
      _id: sessionId,
      refreshToken,
    });
    if (!session) {
      return next(createHttpError(401, 'Session not found'));
    }

    // 2. Перевірка, чи не прострочений refreshToken
    if (new Date() > new Date(session.refreshTokenValidUntil)) {
      return next(createHttpError(401, 'Session token expired'));
    }

    // 3. Видаляємо стару сесію
    await Session.findByIdAndDelete(sessionId);

    // 4. Створюємо нову сесію
    const newSession = await createSession(session.userId);
    setSessionCookies(res, newSession);

    // 5. Відповідь
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
