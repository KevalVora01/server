import { UserRole } from "../../modules/auth/domain/entities/User";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        email: string;
        role: UserRole;
      };
    }
  }
}

export {};