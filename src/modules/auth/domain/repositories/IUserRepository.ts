import { User } from "../entities/User";

export interface IUserRepository {

  findById(id: number): Promise<User | null>;

  findByEmail(email: string): Promise<User | null>;

  findByPhone(phone: string): Promise<User | null>;

  create(user: User): Promise<User>;

  update(user: User): Promise<User>;

  deactivate(id: number): Promise<void>;
}