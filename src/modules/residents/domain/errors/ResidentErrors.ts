export class ResidentNotFoundError extends Error {
  public readonly statusCode = 404;

  constructor() {
    super("Resident not found");
    this.name = "ResidentNotFoundError";
  }
}

export class ResidentAlreadyInactiveError extends Error {
  public readonly statusCode = 400;

  constructor() {
    super("Resident is already deactivated");
    this.name = "ResidentAlreadyInactiveError";
  }
}

export class ApartmentAlreadyOccupiedError extends Error {
  public readonly statusCode = 409;

  constructor() {
    super("This apartment already has an active resident");
    this.name = "ApartmentAlreadyOccupiedError";
  }
}