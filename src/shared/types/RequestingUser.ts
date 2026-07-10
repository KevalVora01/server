import { UserRole } from "../../modules/auth/domain/entities/User";

export interface RequestingUser {
  userId: number;
  role: UserRole;
  residentId?: number;
}