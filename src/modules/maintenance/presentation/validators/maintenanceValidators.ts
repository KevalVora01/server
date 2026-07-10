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
  dueDate: Joi.date().required().messages({
    'any.required': 'Due date is required',
  }),
});

const updateMaintenanceAmountSchema = Joi.object({
  amount: Joi.number().positive().required().messages({
    'number.positive': 'Amount must be greater than 0',
    'any.required': 'Amount is required',
  }),
});

const createPaymentIntentSchema = Joi.object({
  invoiceId: Joi.number().integer().positive().required().messages({
    'any.required': 'invoiceId is required',
  }),
});

export const validateGenerateInvoices = [handleValidationError(generateInvoicesSchema, 'body')];
export const validateUpdateMaintenanceAmount = [handleValidationError(updateMaintenanceAmountSchema, 'body')];
export const validateCreatePaymentIntent = [handleValidationError(createPaymentIntentSchema, 'body')];