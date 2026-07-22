import Joi from "joi";
import { handleValidationError } from "../../../../shared/utils/validateRequest";

const createDocumentRequestSchema = Joi.object({
  documentType: Joi.string().trim().min(2).max(150).required().messages({
    "string.empty": "Document type is required",
    "string.min": "Document type must be at least 2 characters",
    "string.max": "Document type must be at most 150 characters",
  }),

  customDocumentName: Joi.string().trim().max(150).allow(null, "").optional().messages({
    "string.max": "Custom document name must be at most 150 characters",
  }),

  note: Joi.string().trim().max(500).allow(null, "").optional().messages({
    "string.max": "Note must be at most 500 characters",
  }),
});

const rejectDocumentRequestSchema = Joi.object({
  rejectionReason: Joi.string().trim().max(500).allow(null, "").optional().messages({
    "string.max": "Rejection reason must be at most 500 characters",
  }),
});

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
      }),
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

export const validateCreateDocumentRequest = [handleValidationError(createDocumentRequestSchema, "body")];
export const validateRejectDocumentRequest = [handleValidationError(rejectDocumentRequestSchema, "body")];
export const validateBulkRecordVotes = [handleValidationError(bulkRecordVotesSchema, "body")];
