import Joi from 'joi';
import type { Request, Response, NextFunction } from 'express';

export const handleValidationError = (
  schema: Joi.ObjectSchema,
  source: 'body' | 'query'
) => (req: Request, res: Response, next: NextFunction): void => {
  const { error, value } = schema.validate(req[source], { abortEarly: false });
  if (error) {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: error.details.map((d) => d.message),
    });
    return;
  }
  req[source] = value;
  next();
};