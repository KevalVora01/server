import { AppError } from "../../../../shared/errors/AppError";

export class VehicleNotFoundError extends AppError {
  constructor() {
    super("Vehicle not found", 404);
  }
}

export class VehicleNotBelongsToResidentError extends AppError {
  constructor() {
    super("Vehicle does not belong to this resident", 403);
  }
}

export class VehiclePlateAlreadyExistsError extends AppError {
  constructor() {
    super("A vehicle with this plate number already exists", 409);
  }
}