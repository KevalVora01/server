import { UserRole } from "../../domain/entities/User";

export interface CreateUserDto {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
}