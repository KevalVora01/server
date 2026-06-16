import {
  Request,
  Response,
  NextFunction,
} from "express";

import { UserRole } from "../../modules/auth/domain/entities/User";
import { AuthenticatedRequest } from "../types/AuthenticatedRequest";

export const rbacMiddleware = (
  ...allowedRoles: UserRole[]
) => {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    const authReq = req as AuthenticatedRequest;

    if (!authReq.user) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });

      return;
    }

    const userRole = authReq.user.role;

    const isAllowed =
      allowedRoles.includes(userRole);

    if (!isAllowed) {
      res.status(403).json({
        success: false,
        message: "Forbidden",
      });

      return;
    }

    next();
  };
};