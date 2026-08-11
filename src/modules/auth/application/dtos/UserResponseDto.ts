import { UserRole } from "../../domain/entities/User";

export interface ResidentSummaryDto {
  id: number;
  isOwner: boolean;
  isOccupant: boolean;
  moveInDate: Date | null;
  apartmentId: number;
}

export interface UserResponseDto {
  id?: number;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  isActive: boolean;
  mustResetPassword?: boolean;
  resetToken?: string;
  createdAt: Date;
  residentId?: number | null;
  resident?: ResidentSummaryDto | null;
}