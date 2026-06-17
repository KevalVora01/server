import { body, validationResult } from 'express-validator';
import type { Request, Response, NextFunction } from 'express';

// ─── Handle validation errors ─────────────────────────────────────
const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array().map((err) => err.msg),
    });
    return;
  }
  next();
};

// ─── Register validator ───────────────────────────────────────────
export const validateRegister = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number')
    .matches(/[\W_]/).withMessage('Password must contain at least one special character'),

  body('phone')
    .trim()
    .notEmpty().withMessage('Phone is required')
    .isLength({ min: 10, max: 10 }).withMessage('Phone must be exactly 10 digits')
    .isNumeric().withMessage('Phone must contain only numbers'),

  body('role')
    .optional()
    .isIn(['admin', 'resident', 'security']).withMessage('Invalid role'),

  handleValidationErrors,
];

// ─── Login validator ──────────────────────────────────────────────
export const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),

  body('password')
    .notEmpty().withMessage('Password is required'),

  body('role')
    .notEmpty().withMessage('Role is required')
    .isIn(['admin', 'resident', 'security']).withMessage('Invalid role — must be admin, resident or security'),

  handleValidationErrors,
];