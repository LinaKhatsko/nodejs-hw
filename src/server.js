import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { errors } from 'celebrate';
import cookieParser from 'cookie-parser';

import { connectMongoDB } from './db/connectMongoDB.js';
import { logger } from './middleware/logger.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';
import notesRouter from './routes/notesRoutes.js';
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';

const PORT = process.env.PORT || 8080;

const startServer = async () => {
  try {
    console.log('📧 SMTP Configuration:');
    console.log('  HOST:', process.env.SMTP_HOST);
    console.log('  PORT:', process.env.SMTP_PORT);
    console.log('  USER:', process.env.SMTP_USER);
    console.log('  FROM:', process.env.SMTP_FROM);

    await connectMongoDB();
    const app = express();

    // CORS - дозволяємо тільки ваш фронтенд
    app.use(
      cors({
        origin: [
          'https://nodejs-hw.vercel.app',
          'http://localhost:3000', // Для локальної розробки
        ],
        credentials: true, // Дозволяємо куки
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
      }),
    );

    app.use(logger);
    app.use(express.json());
    app.use(cookieParser());

    // Routes
    app.use('/auth', authRouter);
    app.use('/notes', notesRouter);
    app.use('/users', userRouter);

    // Error handling
    app.use(notFoundHandler);
    app.use(errors());
    app.use(errorHandler);

    app.listen(PORT, () => {
      console.log(`✅ Server is running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
