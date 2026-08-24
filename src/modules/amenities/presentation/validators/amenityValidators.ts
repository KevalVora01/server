import Joi from "joi";
import { handleValidationError } from "../../../../shared/utils/validateRequest";

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

const createAmenitySchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    "string.empty": "Amenity name is required",
    "string.min": "Name must be at least 2 characters",
    "string.max": "Name must be at most 100 characters",
  }),
  description: Joi.string().allow("").allow(null).max(1000).optional(),
  capacity: Joi.alternatives().try(Joi.number().integer().min(0), Joi.string().allow("", null)).optional(),
  operatingStart: Joi.string().pattern(timePattern).required().messages({
    "string.pattern.base": "operatingStart must be in HH:MM (24h) format",
    "any.required": "operatingStart is required",
  }),
  operatingEnd: Joi.string().pattern(timePattern).required().messages({
    "string.pattern.base": "operatingEnd must be in HH:MM (24h) format",
    "any.required": "operatingEnd is required",
  }),
  price: Joi.alternatives().try(Joi.number().min(0), Joi.string().allow("", null)).optional().default(0),
  existingImages: Joi.any().optional(),
  images: Joi.any().optional(),
  isActive: Joi.alternatives().try(Joi.boolean(), Joi.string().valid("true", "false")).optional(),
});

const updateAmenitySchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),
  description: Joi.string().allow("").allow(null).max(1000).optional(),
  capacity: Joi.alternatives().try(Joi.number().integer().min(0), Joi.string().allow("", null)).optional(),
  operatingStart: Joi.string().pattern(timePattern).optional(),
  operatingEnd: Joi.string().pattern(timePattern).optional(),
  price: Joi.alternatives().try(Joi.number().min(0), Joi.string().allow("", null)).optional(),
  existingImages: Joi.any().optional(),
  images: Joi.any().optional(),
  isActive: Joi.alternatives().try(Joi.boolean(), Joi.string().valid("true", "false")).optional(),
});

const createBlackoutSchema = Joi.object({
  date: Joi.string()
    .pattern(datePattern)
    .required()
    .custom((value, helpers) => {
      const now = new Date();
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      if (value < todayStr) {
        return helpers.message({ custom: "Blackout date cannot be in the past" });
      }
      return value;
    })
    .messages({
      "string.pattern.base": "date must be in YYYY-MM-DD format",
      "any.required": "date is required",
    }),
  startTime: Joi.string().pattern(timePattern).required().messages({
    "string.pattern.base": "startTime must be in HH:MM (24h) format",
    "any.required": "startTime is required",
  }),
  endTime: Joi.string().pattern(timePattern).required().messages({
    "string.pattern.base": "endTime must be in HH:MM (24h) format",
    "any.required": "endTime is required",
  }),
  reason: Joi.string().trim().min(2).max(500).required().messages({
    "string.empty": "Blackout reason is required",
  }),
}).custom((obj, helpers) => {
  if (obj.startTime >= obj.endTime) {
    return helpers.message({ custom: "Start time must be before end time" });
  }

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const currentTimeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  if (obj.date === todayStr && obj.startTime < currentTimeStr) {
    return helpers.message({ custom: "Blackout start time must be in the future" });
  }

  return obj;
});

const getAvailabilitySchema = Joi.object({
  date: Joi.string().pattern(datePattern).required().messages({
    "string.pattern.base": "date must be in YYYY-MM-DD format",
    "any.required": "date query parameter is required",
  }),
});

export const validateCreateAmenity = [handleValidationError(createAmenitySchema, "body")];
export const validateUpdateAmenity = [handleValidationError(updateAmenitySchema, "body")];
export const validateCreateBlackout = [handleValidationError(createBlackoutSchema, "body")];
export const validateGetAvailability = [handleValidationError(getAvailabilitySchema, "query")];
