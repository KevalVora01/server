import Joi from 'joi';
import { handleValidationError } from '../../../../shared/utils/validateRequest';
import { FamilyRelation } from '../../domain/entities/FamilyMember';

const createFamilyMemberSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    'string.empty': 'Name is required',
    'string.min': 'Name must be at least 2 characters',
    'string.max': 'Name must be at most 100 characters',
  }),

  relation: Joi.string().valid(...Object.values(FamilyRelation)).required().messages({
    'any.only': `Relation must be one of: ${Object.values(FamilyRelation).join(', ')}`,
    'any.required': 'Relation is required',
  }),

  age: Joi.number().integer().min(0).max(120).optional().allow(null).messages({
    'number.base': 'Age must be a number',
    'number.min': 'Age must be at least 0',
    'number.max': 'Age must be at most 120',
  }),
});

const updateFamilyMemberSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional().messages({
    'string.min': 'Name must be at least 2 characters',
    'string.max': 'Name must be at most 100 characters',
  }),

  relation: Joi.string().valid(...Object.values(FamilyRelation)).optional().messages({
    'any.only': `Relation must be one of: ${Object.values(FamilyRelation).join(', ')}`,
  }),

  age: Joi.number().integer().min(0).max(120).optional().allow(null).messages({
    'number.base': 'Age must be a number',
    'number.min': 'Age must be at least 0',
    'number.max': 'Age must be at most 120',
  }),
}).min(1).messages({
  'object.min': 'At least one field is required to update',
});

export const validateCreateFamilyMember = [handleValidationError(createFamilyMemberSchema, 'body')];
export const validateUpdateFamilyMember = [handleValidationError(updateFamilyMemberSchema, 'body')];