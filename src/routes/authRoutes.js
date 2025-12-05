import { Router } from 'express';
import { celebrate } from 'celebrate';
import {
  registerUser,
  loginUser,
  refreshUserSession,
  logoutUser,
} from '../controllers/authController.js';
import {
  registerUserSchema,
  loginUserSchema,
} from '../validations/authValidation.js';

const router = Router();

// /auth/register
router.post('/auth/register', celebrate(registerUserSchema), registerUser);

// /auth/login
router.post('/auth/login', celebrate(loginUserSchema), loginUser);

// /auth/refresh
router.post('/auth/refresh', refreshUserSession);

// /auth/logout
router.post('/auth/logout', logoutUser);

export default router;
