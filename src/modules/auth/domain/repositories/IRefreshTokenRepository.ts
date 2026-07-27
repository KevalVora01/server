import { RefreshToken } from "../entities/RefreshToken";

export interface IRefreshTokenRepository {
  
  create(refreshToken: RefreshToken): Promise<RefreshToken>;

  findByToken(token: string): Promise<RefreshToken | null>;

  deleteByToken(token: string): Promise<void>;

  deleteAllByUserId(userId: number): Promise<void>;

  deleteExpiredTokens(): Promise<void>;
}