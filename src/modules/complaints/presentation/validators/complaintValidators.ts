import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { handleValidationError } from '../../../../shared/utils/validateRequest';
import { ComplaintPriority, ComplaintStatus } from '../../domain/entities/Complaint';

const createComplaintSchema = Joi.object({
  title: Joi.string().trim().min(3).max(150).required().messages({
    'string.empty': 'Title is required',
    'string.min': 'Title must be at least 3 characters',
    'string.max': 'Title must be at most 150 characters',
  }),

  description: Joi.string().trim().min(10).required().messages({
    'string.empty': 'Description is required',
    'string.min': 'Description must be at least 10 characters',
  }),

  priority: Joi.string().valid(...Object.values(ComplaintPriority)).required().messages({
    'any.only': `Priority must be one of: ${Object.values(ComplaintPriority).join(', ')}`,
    'any.required': 'Priority is required',
  }),

  imagesCount: Joi.number().max(5).messages({
    'number.max': 'You can upload a maximum of 5 images per complaint',
  }),
});

const updateComplaintStatusSchema = Joi.object({
  status: Joi.string().valid(...Object.values(ComplaintStatus)).required().messages({
    'any.only': `Status must be one of: ${Object.values(ComplaintStatus).join(', ')}`,
    'any.required': 'Status is required',
  }),
});

const createCommentSchema = Joi.object({
  content: Joi.string().trim().min(1).max(1000).required().messages({
    'string.empty': 'Comment content is required',
    'string.max': 'Comment must be at most 1000 characters',
  }),
});

const attachImagesCount = (req: Request, _res: Response, next: NextFunction): void => {
  const files = (req.files as Express.Multer.File[]) || [];
  req.body.imagesCount = files.length;
  next();
};

export const validateCreateComplaint = [
  attachImagesCount,
  handleValidationError(createComplaintSchema, 'body'),
];
export const validateUpdateComplaintStatus = [handleValidationError(updateComplaintStatusSchema, 'body')];
export const validateCreateComment = [handleValidationError(createCommentSchema, 'body')];