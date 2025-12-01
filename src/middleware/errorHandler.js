import { isHttpError } from 'http-errors';

// Глобальний обробник помилок.
// Express автоматично передає помилку, якщо викликати next(err).
export const errorHandler = (err, req, res, next) => {
  // Логуємо помилку (pino-http додає .log до об'єкту req)
  req.log.error(err);

  // Перевіряємо, чи це помилка з 'http-errors' (напр., 404)
  if (isHttpError(err)) {
    return res.status(err.status).json({
      message: err.message,
    });
  }

  // Якщо це інша, непередбачувана помилка
  res.status(500).json({
    message: 'Something went wrong',
  });
};
