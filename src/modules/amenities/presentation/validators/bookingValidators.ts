import Joi from "joi";
import { handleValidationError } from "../../../../shared/utils/validateRequest";

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

const createBookingSchema = Joi.object({
  amenityId: Joi.number().integer().required().messages({
    "any.required": "amenityId is required",
  }),
  bookingDate: Joi.string().pattern(datePattern).required().messages({
    "string.pattern.base": "bookingDate must be in YYYY-MM-DD format",
    "any.required": "bookingDate is required",
  }),
  startTime: Joi.string().pattern(timePattern).required().messages({
    "string.pattern.base": "startTime must be in HH:MM (24h) format",
    "any.required": "startTime is required",
  }),
  endTime: Joi.string().pattern(timePattern).required().messages({
    "string.pattern.base": "endTime must be in HH:MM (24h) format",
    "any.required": "endTime is required",
  }),
  purpose: Joi.string().allow("").allow(null).max(500),
  residentId: Joi.number().integer().optional(),
  apartmentId: Joi.number().integer().optional(),
});

const cancelBookingSchema = Joi.object({
  reason: Joi.string().trim().min(2).max(500).required().messages({
    "string.empty": "Cancellation reason is required",
  }),
});

const rejectBookingSchema = Joi.object({
  reason: Joi.string().trim().min(2).max(500).required().messages({
    "string.empty": "Rejection reason is required",
  }),
});

const settleBookingSchema = Joi.object({
  paymentRef: Joi.string().trim().min(3).max(100).required().messages({
    "string.empty": "Payment reference (UPI) is required",
  }),
});

const listBookingsQuerySchema = Joi.object({
  amenityId: Joi.number().integer(),
  date: Joi.string().pattern(datePattern),
  status: Joi.string().valid("Pending", "Confirmed", "Rejected", "Cancelled"),
  residentId: Joi.number().integer(),
  scope: Joi.string().valid("upcoming", "past"),
}).unknown(true);

const bulkRecordVotesSchema = Joi.object({
  votes: Joi.array()
    .items(
      Joi.object({
        committeeMemberId: Joi.number().integer().positive().required().messages({
          "number.base": "Committee member ID must be a number",
          "any.required": "Committee member ID is required",
        }),
        vote: Joi.string().valid("Approve", "Reject").required().messages({
          "any.only": "Vote must be 'Approve' or 'Reject'",
          "any.required": "Vote is required",
        }),
      })
    )
    .min(0)
    .optional()
    .messages({
      "array.min": "At least one vote must be provided",
    }),
  adminVote: Joi.string().valid("Approve", "Reject").optional().messages({
    "any.only": "Admin vote must be 'Approve' or 'Reject'",
  }),
}).or("votes", "adminVote").messages({
  "object.missing": "At least one vote or admin vote must be provided.",
});

export const validateCreateBooking = [handleValidationError(createBookingSchema, "body")];
export const validateCancelBooking = [handleValidationError(cancelBookingSchema, "body")];
export const validateRejectBooking = [handleValidationError(rejectBookingSchema, "body")];
export const validateSettleBooking = [handleValidationError(settleBookingSchema, "body")];
export const validateListBookingsQuery = [handleValidationError(listBookingsQuerySchema, "query")];
export const validateBulkRecordVotes = [handleValidationError(bulkRecordVotesSchema, "body")];
