import { AppError } from "../../../../shared/errors/AppError";

export class NoticeNotFoundError extends AppError {
  constructor() {
    super("Notice not found", 404);
  }
}

export class NoticeAlreadyInactiveError extends AppError {
  constructor() {
    super("Notice is already inactive", 400);
  }
}