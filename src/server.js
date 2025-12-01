import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'dotenv/config';
// Імпортуємо наші модулі
import { connectMongoDB } from './db/connectMongoDB.js';
import { logger } from './middleware/logger.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';
import notesRouter from './routes/notesRoutes.js';


// Отримуємо порт з змінних оточення
const PORT = process.env.PORT || 3000;

// Створюємо асинхронну функцію для запуску сервера
// Щоб гарантовано підключитися до БД
// ДО того, як сервер почне приймати запити.
const startServer = async () => {
  try {
    // 1. Підключення до MongoDB
    await connectMongoDB();

    // 2. Створюємо екземпляр Express
    const app = express();

    // 3. Підключаємо Middleware
    app.use(logger); // Логер - першим
    app.use(helmet()); // Підключаємо helmet для безпеки
    app.use(cors()); // CORS
    app.use(express.json()); // Парсер JSON


    // 4. Реєструємо наші маршрути
    app.use(notesRouter);

    // 5. Middleware для обробки неіснуючих маршрутів (404)
    app.use(notFoundHandler);

    // 6. Глобальний обробник помилок (500)
    app.use(errorHandler);

    // 7. Запуск сервера
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1); // Аварійне завершення, якщо не вдалося запустити сервер
  }
};

// Запускаємо сервер
startServer();



