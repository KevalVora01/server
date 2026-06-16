import { User, UserRole } from "../entities/User";

export interface CreateUserData {
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: UserRole;
}

export interface IUserRepository {

  findById(id: number): Promise<User | null>;

  findByEmail(email: string): Promise<User | null>;

  create(data: CreateUserData): Promise<User>;

  update(user: User): Promise<User>;

  deactivate(id: number): Promise<void>;

}