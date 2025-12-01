import express from 'express';
import cors from 'cors';
import pinoHttp from 'pino-http';
import helmet from 'helmet';
import 'dotenv/config';
import { connectMongoDB } from './db/connectMongoDB.js';


// Створюємо екземпляр Express-додатку
const app = express();

// Отримуємо порт з змінних оточення
const PORT = process.env.PORT || 3000;

// Підключаємо Middleware

  // Підключаємо express.json()
app.use(express.json());

  // Налаштовуємо логер pino-http
const logger = pinoHttp();
app.use(logger);

  // Підключаємо cors
app.use(cors());

// Підключаємо helmet для безпеки
app.use(helmet());

// підключення до MongoDB
await connectMongoDB();

// Реалізація маршрутів (Endpoints)
  // Реалізовано маршрут GET /notes
app.get('/notes', (req, res) => {
  res.status(200).json({
    message: 'Retrieved all notes',
  });
});

  // Реалізовано маршрут GET /notes/:noteId
app.get('/notes/:noteId', (req, res) => {
  // :noteId - це динамічний параметр.
  // Express поміщає його в об'єкт req.params.
  const { noteId } = req.params;
  res.status(200).json({
    message: `Retrieved note with ID: ${noteId}`,
  });
});

  // Реалізовано маршрут GET /test-error
app.get('/test-error', (req, res) => {
  // Ми "бросаем" (throw) помилку. Express автоматично
  // перехопить її і передасть в middleware для обробки помилок (500).
  throw new Error('Simulated server error');
});

// Обробка неіснуючих маршрутів (404)
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
  });
});

// Обробка помилок (500)

app.use((err, req, res, next) => {
  // Логируем помилку з допомогою pino (який ми додали в req)
  req.log.error(err);

  // Відправляємо клієнту стандартизований відповідь про помилку
  res.status(500).json({
    message: err.message || 'Something went wrong',
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


