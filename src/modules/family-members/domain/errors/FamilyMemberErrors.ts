import { AppError } from "../../../../shared/errors/AppError";

export class FamilyMemberNotFoundError extends AppError {
  constructor() {
    super("Family member not found", 404);
  }
}

export class FamilyMemberNotBelongsToResidentError extends AppError {
  constructor() {
    super("Family member does not belong to this resident", 403);
  }
}