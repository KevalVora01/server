export class ComplaintNotFoundError extends Error {
  constructor(id: number) {
    super(`Complaint with id ${id} not found`);
    this.name = "ComplaintNotFoundError";
  }
}

export class ComplaintAlreadyResolvedError extends Error {
  constructor() {
    super("This complaint is resolved and cannot be modified");
    this.name = "ComplaintAlreadyResolvedError";
  }
}

export class InvalidStatusTransitionError extends Error {
  constructor(from: string, to: string) {
    super(`Cannot transition complaint status from '${from}' to '${to}'`);
    this.name = "InvalidStatusTransitionError";
  }
}

export class UnauthorizedComplaintAccessError extends Error {
  constructor() {
    super("You do not have permission to access this complaint");
    this.name = "UnauthorizedComplaintAccessError";
  }
}

export class ComplaintCannotBeDeletedError extends Error {
  constructor(status: string) {
    super(`Only open complaints can be deleted. Current status: '${status}'`);
    this.name = "ComplaintCannotBeDeletedError";
  }
}