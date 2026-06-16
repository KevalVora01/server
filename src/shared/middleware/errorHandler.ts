import { Request, Response, NextFunction } from "express";
import { AppError } from "../../modules/auth/domain/errors/AuthErrors";
import { ApiResponse } from "../utils/apiResponse";

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {

  console.error(`[Error Handler Triggered]:`, error);

  if (error instanceof AppError) {
    res.status(error.statusCode).json(
      ApiResponse.error(error.message)
    );
    return;
  }

  res.status(500).json(
    ApiResponse.error("Internal Server Error")
  );
};