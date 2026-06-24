export class ApartmentNotFoundError extends Error {
  public readonly statusCode = 404;

  constructor() {
    super("Apartment not found");
    this.name = "ApartmentNotFoundError";
  }
}

export class ApartmentAlreadyExistsError extends Error {
  public readonly statusCode = 409;

  constructor() {
    super("An apartment with this block and flat number already exists");
    this.name = "ApartmentAlreadyExistsError";
  }
}