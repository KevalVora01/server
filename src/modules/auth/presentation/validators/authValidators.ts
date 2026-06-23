import Joi from 'joi';
import { handleValidationError } from '../../../../shared/utils/validateRequest';


// ─── Schemas ──────────────────────────────────────────────────────
const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).required().messages({
    'string.empty': 'Name is required',
    'string.min': 'Name must be at least 2 characters',
  }),

  email: Joi.string().trim().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please provide a valid email',
  }),

  password: Joi.string()
    .min(8)
    .pattern(/[A-Z]/)
    .pattern(/[0-9]/)
    .pattern(/[\W_]/)
    .required()
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 8 characters',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one number, and one special character',
    }),

  phone: Joi.string().trim().length(10).pattern(/^[0-9]+$/).required().messages({
    'string.empty': 'Phone is required',
    'string.length': 'Phone must be exactly 10 digits',
    'string.pattern.base': 'Phone must contain only numbers',
  }),

  role: Joi.string().valid('admin', 'resident', 'security').optional().messages({
    'any.only': 'Invalid role',
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().trim().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please provide a valid email',
  }),

  password: Joi.string().required().messages({
    'string.empty': 'Password is required',
  }),

  role: Joi.string().valid('admin', 'resident', 'security').required().messages({
    'string.empty': 'Role is required',
    'any.only': 'Invalid role — must be admin, resident or security',
  }),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().trim().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please provide a valid email',
  }),
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages({
    'string.empty': 'Reset token is required',
  }),

  newPassword: Joi.string()
    .min(8)
    .pattern(/[A-Z]/)
    .pattern(/[0-9]/)
    .pattern(/[\W_]/)
    .required()
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 8 characters',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one number, and one special character',
    }),
});

// ─── Exported validators ──────────────────────────────────────────
export const validateRegister = [handleValidationError(registerSchema, 'body')];
export const validateLogin = [handleValidationError(loginSchema, 'body')];

export const validateForgotPassword = [handleValidationError(forgotPasswordSchema, 'body')];
export const validateResetPassword = [handleValidationError(resetPasswordSchema, 'body')];