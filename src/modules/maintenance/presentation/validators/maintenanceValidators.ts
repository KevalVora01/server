import Joi from 'joi';
import { handleValidationError } from '../../../../shared/utils/validateRequest';

const generateInvoicesSchema = Joi.object({
  month: Joi.number().integer().min(1).max(12).required().messages({
    'number.min': 'Month must be between 1 and 12',
    'number.max': 'Month must be between 1 and 12',
    'any.required': 'Month is required',
  }),
  year: Joi.number().integer().min(2020).max(2100).required().messages({
    'any.required': 'Year is required',
  }),
  dueDate: Joi.date().greater('now').required().messages({
    'date.greater': 'Due date must be in the future',
    'any.required': 'Due date is required',
  }),
  extraCharges: Joi.array().items(
    Joi.object({
      label: Joi.string().required().messages({ 'any.required': 'Charge description is required' }),
      amount: Joi.number().positive().required().messages({ 'any.required': 'Charge amount must be positive' }),
    })
  ).optional(),
});

const updateMaintenanceAmountSchema = Joi.object({
  amount: Joi.number().positive().required().messages({
    'number.positive': 'Amount must be greater than 0',
    'any.required': 'Amount is required',
  }),
});

export const validateGenerateInvoices = [handleValidationError(generateInvoicesSchema, 'body')];
export const validateUpdateMaintenanceAmount = [handleValidationError(updateMaintenanceAmountSchema, 'body')];