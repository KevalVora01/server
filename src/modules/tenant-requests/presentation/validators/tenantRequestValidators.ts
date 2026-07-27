import Joi from 'joi';
import { handleValidationError } from '../../../../shared/utils/validateRequest';
import { VoteChoice } from '../../domain/entities/TenantRequestVote';

const submitTenantRequestSchema = Joi.object({
  tenantName: Joi.string().trim().min(2).max(150).required().messages({
    'string.empty': 'Tenant name is required',
    'string.min': 'Tenant name must be at least 2 characters',
  }),

  tenantEmail: Joi.string().trim().email().required().messages({
    'string.empty': 'Tenant email is required',
    'string.email': 'Please provide a valid email',
  }),

  tenantPhone: Joi.string().trim().length(10).pattern(/^[0-9]+$/).required().messages({
    'string.empty': 'Tenant phone is required',
    'string.length': 'Phone must be exactly 10 digits',
    'string.pattern.base': 'Phone must contain only numbers',
  }),

  moveInDate: Joi.date().iso().required().messages({
    'date.base': 'Move-in date must be a valid date',
    'any.required': 'Move-in date is required',
  }),
});

const bulkRecordVotesSchema = Joi.object({
  adminVote: Joi.string().valid(...Object.values(VoteChoice)).optional().messages({
    'any.only': `Vote must be one of: ${Object.values(VoteChoice).join(', ')}`,
  }),

  votes: Joi.array()
    .items(
      Joi.object({
        committeeMemberId: Joi.number().integer().positive().required().messages({
          'number.base': 'committeeMemberId must be a number',
          'any.required': 'committeeMemberId is required for each vote',
        }),
        vote: Joi.string().valid(...Object.values(VoteChoice)).required().messages({
          'any.only': `Vote must be one of: ${Object.values(VoteChoice).join(', ')}`,
          'any.required': 'Vote is required for each entry',
        }),
      })
    )
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one committee member vote is required',
      'any.required': 'votes is required',
    }),
});

export const validateSubmitTenantRequest = [handleValidationError(submitTenantRequestSchema, 'body')];
export const validateBulkRecordVotes = [handleValidationError(bulkRecordVotesSchema, 'body')];