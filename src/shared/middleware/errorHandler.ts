import { Request, Response, NextFunction } from "express";
import { AppError } from "../../modules/auth/domain/errors/AuthErrors";
import { ApiResponse } from "../utils/apiResponse";
import { TokenExpiredError, JsonWebTokenError } from "jsonwebtoken";

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {

  console.error(`[Error Handler Triggered]:`, error);

  if (error instanceof TokenExpiredError) {
    res.status(401).json(ApiResponse.error("Session expired. Please log in again."));
    return;
  }

  if (error instanceof JsonWebTokenError) {
    res.status(401).json(ApiResponse.error("Invalid token."));
    return;
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json(ApiResponse.error(error.message));
    return;
  }

  res.status(500).json(ApiResponse.error("Internal Server Error"));
};