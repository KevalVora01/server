import {
  Request,
  Response,
  NextFunction,
} from "express";

import { JwtTokenService } from "../../modules/auth/infrastructure/services/JwtTokenService";
import { AuthenticatedRequest } from "../types/AuthenticatedRequest";

export const jwtMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader =
      req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      res.status(401).json({
        success: false,
        message: "Access token is required",
      });

      return;
    }

    const token =
      authHeader.split(" ")[1];

    const tokenService =
      new JwtTokenService();

    const payload =
      tokenService.verifyAccessToken(
        token
      );

    (req as AuthenticatedRequest).user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};