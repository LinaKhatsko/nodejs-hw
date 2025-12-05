import { Joi, Segments } from 'celebrate';

// Схема для POST /auth/register
export const registerUserSchema = {
  [Segments.BODY]: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    username: Joi.string().optional(), // Додамо username, хоч він і не обов'язковий
  }),
};

// Схема для POST /auth/login
export const loginUserSchema = {
  [Segments.BODY]: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
};
