import { Router } from 'express';
import { celebrate } from 'celebrate';
import {
  registerUser,
  loginUser,
  refreshUserSession,
  logoutUser,
  requestResetEmail,
  resetPassword,
} from '../controllers/authController.js';
import {
  registerUserSchema,
  loginUserSchema,
  requestResetEmailSchema,
  resetPasswordSchema,
} from '../validations/authValidation.js';

const router = Router();

// /register
router.post('/auth/register', celebrate(registerUserSchema), registerUser);

// /login
router.post('/auth/login', celebrate(loginUserSchema), loginUser);

// /refresh
router.post('/auth/refresh', refreshUserSession);

// /logout
router.post('/auth/logout', logoutUser);

// POST /request-reset-email
router.post(
  '/auth/request-reset-email',
  celebrate(requestResetEmailSchema),
  requestResetEmail,
);

// POST /reset-password
router.post('/auth/reset-password', celebrate(resetPasswordSchema), resetPassword);

export default router;
