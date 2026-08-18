import Joi from 'joi';
import { handleValidationError } from '../../../../shared/utils/validateRequest';

const markAsReadSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'any.required': 'id is required',
    'number.base': 'id must be a number',
  }),
});

export const validateMarkAsRead = [handleValidationError(markAsReadSchema, 'body')];