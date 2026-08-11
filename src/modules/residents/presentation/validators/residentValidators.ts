import Joi from 'joi';
import { handleValidationError } from '../../../../shared/utils/validateRequest';

// ─── Schemas ──────────────────────────────────────────────────────
export const createResidentSchema = Joi.object({
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
    .optional()
    .messages({
      'string.min': 'Password must be at least 8 characters',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one number, and one special character',
    }),

  phone: Joi.string().trim().length(10).pattern(/^[0-9]+$/).required().messages({
    'string.empty': 'Phone is required',
    'string.length': 'Phone must be exactly 10 digits',
    'string.pattern.base': 'Phone must contain only numbers',
  }),

  apartmentId: Joi.number().integer().required().messages({
    'number.base': 'Apartment ID must be a number',
    'any.required': 'Apartment ID is required',
  }),
});

export const importResidentRowSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    'string.empty': 'Name is required',
    'string.min': 'Name must be at least 2 characters',
    'string.max': 'Name must be at most 100 characters',
  }),

  email: Joi.string().trim().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please provide a valid email',
  }),

  phone: Joi.string().trim().pattern(/^[0-9+]{7,15}$/).required().messages({
    'string.empty': 'Phone number is required',
    'string.pattern.base': 'Phone number must contain between 7 and 15 digits',
  }),

  block: Joi.string().trim().uppercase().length(1).required().messages({
    'string.empty': 'Block is required',
    'string.length': 'Block must be a single character (e.g. A, B)',
  }),

  floorNumber: Joi.number().integer().min(1).max(100).required().messages({
    'number.base': 'Floor number must be a number',
    'number.min': 'Floor number must be at least 1',
    'number.max': 'Floor number must be at most 100',
    'any.required': 'Floor number is required',
  }),

  unitNumber: Joi.string().trim().pattern(/^\d{1,2}$/).custom((value, helpers) => {
    if (Number(value) === 0) {
      return helpers.error('unitNumber.zero');
    }
    return value.padStart(2, '0');
  }).required().messages({
    'string.empty': 'Unit number is required',
    'string.pattern.base': 'Unit number must be 1 or 2 digits (e.g. 01, 12)',
    'unitNumber.zero': 'Unit number cannot be 0',
  }),
});

const updateResidentSchema = Joi.object({
  apartmentId: Joi.number().integer().required().messages({
    'number.base': 'Apartment ID must be a number',
    'any.required': 'Apartment ID is required',
  }),

  name: Joi.string().trim().min(2).max(100).optional().messages({
    'string.min': 'Name must be at least 2 characters',
    'string.max': 'Name must be at most 100 characters',
  }),

  phone: Joi.string().trim().length(10).pattern(/^[0-9]+$/).optional().messages({
    'string.length': 'Phone must be exactly 10 digits',
    'string.pattern.base': 'Phone must contain only numbers',
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
  pageNumber: Joi.number().integer().positive().default(1),
  pageSize: Joi.number().integer().positive().max(100).default(10),
  apartmentId: Joi.number().integer().positive().optional(),
  isOwner: Joi.boolean().optional(),
  isActive: Joi.boolean().optional(),
  search: Joi.string().trim().allow('').optional(),
});

// ─── Exported validators ──────────────────────────────────────────
export const validateCreateResident = [handleValidationError(createResidentSchema, 'body')];
export const validateUpdateResident = [handleValidationError(updateResidentSchema, 'body')];
export const validateListResidents = [handleValidationError(listResidentsSchema, 'query')];