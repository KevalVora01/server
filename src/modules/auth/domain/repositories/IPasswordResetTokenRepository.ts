import { PasswordResetToken } from "../entities/PasswordResetToken";

export interface IPasswordResetTokenRepository {
  create(token: PasswordResetToken): Promise<PasswordResetToken>;
  findByToken(token: string): Promise<PasswordResetToken | null>;
  deleteByUserId(userId: number): Promise<void>;
  deleteByToken(token: string): Promise<void>;
}