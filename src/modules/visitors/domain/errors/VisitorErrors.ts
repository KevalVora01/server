export class VisitorNotFoundError extends Error {
  public readonly statusCode = 404;
  constructor(id: number) {
    super(`Visitor with id ${id} not found`);
    this.name = "VisitorNotFoundError";
  }
}

export class VisitorNotPendingError extends Error {
  public readonly statusCode = 400;
  constructor() {
    super("This visitor request is not pending — it has already been decided");
    this.name = "VisitorNotPendingError";
  }
}

export class VisitorNotApprovedError extends Error {
  public readonly statusCode = 400;
  constructor() {
    super("Only an approved visitor can be checked in");
    this.name = "VisitorNotApprovedError";
  }
}

export class VisitorNotCheckedInError extends Error {
  public readonly statusCode = 400;
  constructor() {
    super("Only a checked-in visitor can be checked out");
    this.name = "VisitorNotCheckedInError";
  }
}

export class UnauthorizedVisitorAccessError extends Error {
  public readonly statusCode = 403;
  constructor() {
    super("You do not have permission to respond to this visitor request");
    this.name = "UnauthorizedVisitorAccessError";
  }
}

export class ResidentNotOccupantError extends Error {
  public readonly statusCode = 400;
  constructor() {
    super("Only the current occupant of the apartment can perform this action");
    this.name = "ResidentNotOccupantError";
  }
}

export class VisitorPhotoRequiredError extends Error {
  public readonly statusCode = 400;
  constructor() {
    super("A photo of the visitor is required for check-in");
    this.name = "VisitorPhotoRequiredError";
  }
}

export class VisitorNotPreRegisteredError extends Error {
  public readonly statusCode = 400;
  constructor() {
    super("Only pre-registered visitors can be cancelled this way");
    this.name = "VisitorNotPreRegisteredError";
  }
}

export class VisitorAlreadyCheckedInError extends Error {
  public readonly statusCode = 400;
  constructor() {
    super("Cannot cancel a visitor who has already checked in");
    this.name = "VisitorAlreadyCheckedInError";
  }
}

export class ApartmentOccupantNotFoundError extends Error {
  public readonly statusCode = 404;
  constructor() {
    super("No occupant is assigned to this apartment; cannot log a walk-in visitor");
    this.name = "ApartmentOccupantNotFoundError";
  }
}

export class VisitorPersistenceError extends Error {
  public readonly statusCode = 500;
  constructor(message = "Failed to persist visitor changes") {
    super(message);
    this.name = "VisitorPersistenceError";
  }
}