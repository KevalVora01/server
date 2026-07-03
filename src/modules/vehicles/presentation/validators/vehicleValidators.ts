import Joi from 'joi';
import { handleValidationError } from '../../../../shared/utils/validateRequest';
import { VehicleType, FuelType } from '../../domain/entities/Vehicle';

const createVehicleSchema = Joi.object({
  plateNumber: Joi.string().trim().min(1).max(20).required().messages({
    'string.empty': 'Plate number is required',
    'string.max': 'Plate number must be at most 20 characters',
  }),

  type: Joi.string().valid(...Object.values(VehicleType)).required().messages({
    'any.only': `Type must be one of: ${Object.values(VehicleType).join(', ')}`,
    'any.required': 'Type is required',
  }),

  brandName: Joi.string().trim().min(1).max(50).required().messages({
    'string.empty': 'Brand name is required',
    'string.max': 'Brand name must be at most 50 characters',
  }),

  model: Joi.string().trim().min(1).max(50).required().messages({
    'string.empty': 'Model is required',
    'string.max': 'Model must be at most 50 characters',
  }),

  color: Joi.string().trim().min(1).max(30).required().messages({
    'string.empty': 'Color is required',
    'string.max': 'Color must be at most 30 characters',
  }),

  fuelType: Joi.string().valid(...Object.values(FuelType)).required().messages({
    'any.only': `Fuel type must be one of: ${Object.values(FuelType).join(', ')}`,
    'any.required': 'Fuel type is required',
  }),
});

const updateVehicleSchema = Joi.object({
  plateNumber: Joi.string().trim().min(1).max(20).optional().messages({
    'string.max': 'Plate number must be at most 20 characters',
  }),

  type: Joi.string().valid(...Object.values(VehicleType)).optional().messages({
    'any.only': `Type must be one of: ${Object.values(VehicleType).join(', ')}`,
  }),

  brandName: Joi.string().trim().min(1).max(50).optional().messages({
    'string.max': 'Brand name must be at most 50 characters',
  }),

  model: Joi.string().trim().min(1).max(50).optional().messages({
    'string.max': 'Model must be at most 50 characters',
  }),

  color: Joi.string().trim().min(1).max(30).optional().messages({
    'string.max': 'Color must be at most 30 characters',
  }),

  fuelType: Joi.string().valid(...Object.values(FuelType)).optional().messages({
    'any.only': `Fuel type must be one of: ${Object.values(FuelType).join(', ')}`,
  }),
}).min(1).messages({
  'object.min': 'At least one field is required to update',
});

export const validateCreateVehicle = [handleValidationError(createVehicleSchema, 'body')];
export const validateUpdateVehicle = [handleValidationError(updateVehicleSchema, 'body')];