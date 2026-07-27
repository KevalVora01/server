import Joi from 'joi';
import { handleValidationError } from '../../../../shared/utils/validateRequest';

const markAsReadSchema = Joi.object({
  ids: Joi.array().items(Joi.number().integer().positive()).min(1).required().messages({
    'array.min': 'At least one notification id is required',
    'any.required': 'ids is required',
  }),
});

export const validateMarkAsRead = [handleValidationError(markAsReadSchema, 'body')];