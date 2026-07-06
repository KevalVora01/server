import Joi from 'joi';
import { handleValidationError } from '../../../../shared/utils/validateRequest';
import { NoticeCategory } from '../../domain/entities/Notice';

const createNoticeSchema = Joi.object({
  title: Joi.string().trim().min(3).max(150).required().messages({
    'string.empty': 'Title is required',
    'string.min': 'Title must be at least 3 characters',
    'string.max': 'Title must be at most 150 characters',
  }),

  body: Joi.string().trim().min(10).required().messages({
    'string.empty': 'Body is required',
    'string.min': 'Body must be at least 10 characters',
  }),

  category: Joi.string().valid(...Object.values(NoticeCategory)).required().messages({
    'any.only': `Category must be one of: ${Object.values(NoticeCategory).join(', ')}`,
    'any.required': 'Category is required',
  }),
});

const updateNoticeSchema = Joi.object({
  title: Joi.string().trim().min(3).max(150).optional().messages({
    'string.min': 'Title must be at least 3 characters',
    'string.max': 'Title must be at most 150 characters',
  }),

  body: Joi.string().trim().min(10).optional().messages({
    'string.min': 'Body must be at least 10 characters',
  }),

  category: Joi.string().valid(...Object.values(NoticeCategory)).optional().messages({
    'any.only': `Category must be one of: ${Object.values(NoticeCategory).join(', ')}`,
  }),
}).min(1).messages({
  'object.min': 'At least one field is required to update',
});

export const validateCreateNotice = [handleValidationError(createNoticeSchema, 'body')];
export const validateUpdateNotice = [handleValidationError(updateNoticeSchema, 'body')];