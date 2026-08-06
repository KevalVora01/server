import { Request, Response, NextFunction } from "express";
import { ITokenService } from "../../modules/auth/domain/services/ITokenService";
import { AuthenticatedRequest } from "../types/AuthenticatedRequest";
import { ApiResponse } from "../utils/apiResponse";

export const createJwtMiddleware = (tokenService: ITokenService) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json(
          ApiResponse.error("Access token is required")
        );
        return;
      }

      const token = authHeader.split(" ")[1];

      const payload = tokenService.verifyAccessToken(token);

      if (!payload) {
        res.status(401).json(
          ApiResponse.error("Invalid or expired session token.")
        );
        return;
      }

      (req as AuthenticatedRequest).user = {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        mustResetPassword: payload.mustResetPassword,
      };

      if (payload.mustResetPassword) {
        res.status(403).json(
          ApiResponse.error("Password reset required before accessing this resource.")
        );
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};