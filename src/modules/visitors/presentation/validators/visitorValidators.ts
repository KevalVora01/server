import Joi from 'joi';
import { handleValidationError } from '../../../../shared/utils/validateRequest';

const preRegisterVisitorSchema = Joi.object({
  name: Joi.string().trim().min(2).max(150).required().messages({
    'string.empty': 'Visitor name is required',
  }),

  phone: Joi.string().trim().length(10).pattern(/^[0-9]+$/).required().messages({
    'string.empty': 'Phone is required',
    'string.length': 'Phone must be exactly 10 digits',
    'string.pattern.base': 'Phone must contain only numbers',
  }),

  purpose: Joi.string().trim().min(2).max(255).required().messages({
    'string.empty': 'Purpose is required',
  }),

  expectedAt: Joi.date().iso().required().messages({
    'any.required': 'Expected arrival time is required',
  }),
});

const logWalkInVisitorSchema = Joi.object({
  apartmentId: Joi.number().integer().positive().required().messages({
    'any.required': 'apartmentId is required',
  }),

  name: Joi.string().trim().min(2).max(150).required().messages({
    'string.empty': 'Visitor name is required',
  }),

  phone: Joi.string().trim().length(10).pattern(/^[0-9]+$/).required().messages({
    'string.empty': 'Phone is required',
    'string.length': 'Phone must be exactly 10 digits',
    'string.pattern.base': 'Phone must contain only numbers',
  }),

  purpose: Joi.string().trim().min(2).max(255).required().messages({
    'string.empty': 'Purpose is required',
  }),

  vehicleNumber: Joi.string().trim().max(20).optional().allow(''),
});

const respondToApprovalSchema = Joi.object({
  decision: Joi.string().valid('Approve', 'Reject').required().messages({
    'any.only': "Decision must be 'Approve' or 'Reject'",
    'any.required': 'Decision is required',
  }),
});

export const validatePreRegisterVisitor = [handleValidationError(preRegisterVisitorSchema, 'body')];
export const validateLogWalkInVisitor = [handleValidationError(logWalkInVisitorSchema, 'body')];
export const validateRespondToApproval = [handleValidationError(respondToApprovalSchema, 'body')];