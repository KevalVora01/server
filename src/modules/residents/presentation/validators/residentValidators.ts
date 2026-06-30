import Joi from 'joi';
import { handleValidationError } from '../../../../shared/utils/validateRequest';

// ─── Schemas ──────────────────────────────────────────────────────
const createResidentSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    'string.empty': 'Name is required',
    'string.min': 'Name must be at least 2 characters',
    'string.max': 'Name must be at most 100 characters',
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

  apartmentId: Joi.number().integer().optional().messages({
    'number.base': 'Apartment ID must be a number',
  }),

  isOwner: Joi.boolean().required().messages({
    'boolean.base': 'isOwner must be a boolean',
    'any.required': 'isOwner is required',
  }),
});

const updateResidentSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional().messages({
    'string.min': 'Name must be at least 2 characters',
    'string.max': 'Name must be at most 100 characters',
  }),

  phone: Joi.string().trim().length(10).pattern(/^[0-9]+$/).optional().messages({
    'string.length': 'Phone must be exactly 10 digits',
    'string.pattern.base': 'Phone must contain only numbers',
  }),

  apartmentId: Joi.number().integer().positive().optional().messages({
    'number.base': 'Apartment ID must be a number',
    'number.positive': 'Apartment ID must be a positive number',
  }),

  isOwner: Joi.boolean().optional().messages({
    'boolean.base': 'isOwner must be a boolean',
  }),

  moveOutDate: Joi.date().iso().max('now').optional().allow(null, '')
    .messages({
      'date.base': 'Move out date must be a valid date',
      'date.format': 'Move out date must be in ISO format',
      'date.max': 'Move out date cannot be in the future',
    }),
}).min(1).messages({
  'object.min': 'At least one field is required to update',
});

const listResidentsSchema = Joi.object({
  pageNumber: Joi.number().integer().positive().default(1).messages({
    'number.base': 'Page number must be a number',
    'number.positive': 'Page number must be a positive number',
  }),

  pageSize: Joi.number().integer().positive().max(100).default(10).messages({
    'number.base': 'Page size must be a number',
    'number.positive': 'Page size must be a positive number',
    'number.max': 'Page size must be at most 100',
  }),

  apartmentId: Joi.number().integer().positive().optional().messages({
    'number.base': 'Apartment ID must be a number',
  }),

  isActive: Joi.boolean().optional().messages({
    'boolean.base': 'isActive must be a boolean',
  }),

  isOwner: Joi.boolean().optional().messages({
    'boolean.base': 'isOwner must be a boolean',
  }),

  search: Joi.string().trim().max(100).optional().messages({
    'string.max': 'Search must be at most 100 characters',
  }),
});

// ─── Exported validators ──────────────────────────────────────────
export const validateCreateResident = [handleValidationError(createResidentSchema, 'body')];
export const validateUpdateResident = [handleValidationError(updateResidentSchema, 'body')];
export const validateListResidents = [handleValidationError(listResidentsSchema, 'query')];