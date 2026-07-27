import { AppError } from "../../../../shared/errors/AppError";

export class DocumentRequestNotFoundError extends AppError {
  constructor(id?: number) {
    super(id ? `Document request with ID ${id} not found.` : "Document request not found.", 404);
    this.name = "DocumentRequestNotFoundError";
  }
}

export class UnauthorizedDocumentRequestAccessError extends AppError {
  constructor() {
    super("You are not authorized to perform this document request action.", 403);
    this.name = "UnauthorizedDocumentRequestAccessError";
  }
}

export class DocumentOwnerNotFoundError extends AppError {
  constructor() {
    super("Owner for this apartment not found.", 404);
    this.name = "DocumentOwnerNotFoundError";
  }
}

export class NoApartmentAssociatedError extends AppError {
  constructor() {
    super("No apartment associated with your account.", 400);
    this.name = "NoApartmentAssociatedError";
  }
}

export class DocumentRequestVotingError extends AppError {
  constructor(message: string) {
    super(message, 400);
    this.name = "DocumentRequestVotingError";
  }
}

export class DocumentRequestAlreadyFinalizedError extends AppError {
  constructor() {
    super("Document request has already been finalized.", 400);
    this.name = "DocumentRequestAlreadyFinalizedError";
  }
}

export class DocumentRequestNotReadyForUploadError extends AppError {
  constructor() {
    super("Document request must be approved before uploading.", 400);
    this.name = "DocumentRequestNotReadyForUploadError";
  }
}
