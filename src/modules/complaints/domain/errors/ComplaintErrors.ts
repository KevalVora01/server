import { AppError } from "../../../../shared/errors/AppError";

export class ComplaintNotFoundError extends AppError {
  constructor(id: number) {
    super(`Complaint with id ${id} not found`, 404);
    this.name = "ComplaintNotFoundError";
  }
}

export class ComplaintAlreadyResolvedError extends AppError {
  constructor() {
    super("This complaint is resolved and cannot be modified", 400);
    this.name = "ComplaintAlreadyResolvedError";
  }
}

export class InvalidStatusTransitionError extends AppError {
  constructor(from: string, to: string) {
    super(`Cannot transition complaint status from '${from}' to '${to}'`, 400);
    this.name = "InvalidStatusTransitionError";
  }
}

export class UnauthorizedComplaintAccessError extends AppError {
  constructor() {
    super("You do not have permission to access this complaint", 403);
    this.name = "UnauthorizedComplaintAccessError";
  }
}

export class ComplaintCannotBeDeletedError extends AppError {
  constructor(status: string) {
    super(`Only open complaints can be deleted. Current status: '${status}'`, 400);
    this.name = "ComplaintCannotBeDeletedError";
  }
}

export class DomainValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
    this.name = "DomainValidationError";
  }
}

export class ResidentNotOccupantError extends Error {
  constructor() {
    super("Only the current occupant of the apartment can raise a complaint");
    this.name = "ResidentNotOccupantError";
  }
}