import Joi from 'joi';
import { handleValidationError } from '../../../../shared/utils/validateRequest';
import { ApartmentType } from '../../domain/entities/Apartment';

// ─── Schemas ──────────────────────────────────────────────────────

const createApartmentSchema = Joi.object({
  block: Joi.string().trim().uppercase().length(1).required().messages({
    'string.empty': 'Block is required',
    'string.length': 'Block must be exactly 1 character',
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
    return value;
  }).required().messages({
    'string.empty': 'Unit number is required',
    'string.pattern.base': 'Unit number must be 1 or 2 digits (e.g. 01, 12)',
    'unitNumber.zero': 'Unit number cannot be 0',
  }),

  areaSqft: Joi.number().positive().required().messages({
    'number.base': 'Area must be a number',
    'number.positive': 'Area must be a positive number',
    'any.required': 'Area is required',
  }),

  type: Joi.string().valid(...Object.values(ApartmentType)).required().messages({
    'any.only': `Type must be one of: ${Object.values(ApartmentType).join(', ')}`,
    'any.required': 'Type is required',
  }),
});

const updateApartmentSchema = Joi.object({
  block: Joi.string().trim().uppercase().length(1).optional().messages({
    'string.length': 'Block must be a single character',
  }),

  floorNumber: Joi.number().integer().min(0).max(100).optional().messages({
    'number.base': 'Floor number must be a number',
    'number.min': 'Floor number must be at least 0',
    'number.max': 'Floor number must be at most 100',
  }),

  unitNumber: Joi.string().trim().pattern(/^\d{1,2}$/).custom((value, helpers) => {
    if (Number(value) === 0) {
      return helpers.error('unitNumber.zero');
    }
    return value;
  }).required().messages({
    'string.empty': 'Unit number is required',
    'string.pattern.base': 'Unit number must be 1 or 2 digits (e.g. 01, 12)',
    'unitNumber.zero': 'Unit number cannot be 0',
  }),

  areaSqft: Joi.number().positive().optional().messages({
    'number.base': 'Area must be a number',
    'number.positive': 'Area must be a positive number',
  }),

  type: Joi.string().valid(...Object.values(ApartmentType)).optional().messages({
    'any.only': `Type must be one of: ${Object.values(ApartmentType).join(', ')}`,
  }),
}).min(1).messages({
  'object.min': 'At least one field is required to update',
});

const listApartmentsSchema = Joi.object({
  pageNumber: Joi.number().integer().positive().default(1),
  pageSize: Joi.number().integer().positive().max(100).default(10),
  block: Joi.string().trim().uppercase().optional(),
  floorNumber: Joi.number().integer().min(0).optional(),
  type: Joi.string().valid(...Object.values(ApartmentType)).optional(),
});

// ─── Exported validators ──────────────────────────────────────────

export const validateCreateApartment = [handleValidationError(createApartmentSchema, 'body')];
export const validateUpdateApartment = [handleValidationError(updateApartmentSchema, 'body')];
export const validateListApartments = [handleValidationError(listApartmentsSchema, 'query')];