import { UserRole } from "../../domain/entities/User";

export interface UserResponseDto {
  id?: number;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
}