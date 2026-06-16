import { Request, Response, NextFunction } from "express";
import { UserRole } from "../../modules/auth/domain/entities/User";
import { AuthenticatedRequest } from "../types/AuthenticatedRequest";
import { ApiResponse } from "../utils/apiResponse";

export const rbacMiddleware = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authReq = req as AuthenticatedRequest;

    if (!authReq.user) {
      res.status(401).json(
        ApiResponse.error("Authentication session data missing. Access denied.")
      );
      return;
    }

    const userRole = authReq.user.role;

    const isAllowed = allowedRoles.includes(userRole);

    if (!isAllowed) {
      res.status(403).json(
        ApiResponse.error("Forbidden: Your account does not possess necessary permissions.")
      );
      return;
    }

    next();
  };
};