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
router.post('/register', celebrate(registerUserSchema), registerUser);

// /login
router.post('/login', celebrate(loginUserSchema), loginUser);

// /refresh
router.post('/refresh', refreshUserSession);

// /logout
router.post('/logout', logoutUser);

// POST /request-reset-email
router.post(
  '/request-reset-email',
  celebrate(requestResetEmailSchema),
  requestResetEmail,
);

// POST /reset-password
router.post('/reset-password', celebrate(resetPasswordSchema), resetPassword);

export default router;
