import { AppError } from "../../../../shared/errors/AppError";

export class ApartmentNotFoundError extends AppError {
  constructor() {
    super("Apartment not found", 404);
  }
}

export class ApartmentAlreadyExistsError extends AppError {
  constructor() {
    super("An apartment with this block and flat number already exists", 409);
  }
}