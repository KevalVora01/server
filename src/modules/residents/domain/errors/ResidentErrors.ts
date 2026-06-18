export class ResidentNotFoundError extends Error {
  public readonly statusCode = 404;

  constructor() {
    super("Resident not found");
    this.name = "ResidentNotFoundError";
  }
}

export class ResidentAlreadyExistsError extends Error {
  public readonly statusCode = 409;

  constructor() {
    super("A resident with this user account already exists");
    this.name = "ResidentAlreadyExistsError";
  }
}

export class ResidentAlreadyInactiveError extends Error {
  public readonly statusCode = 400;

  constructor() {
    super("Resident is already deactivated");
    this.name = "ResidentAlreadyInactiveError";
  }
}