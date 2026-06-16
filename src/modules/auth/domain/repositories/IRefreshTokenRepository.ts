import { RefreshToken } from "../entities/RefreshToken";

export interface CreateRefreshTokenData {
  userId: number;
  token: string;
  expiresAt: Date;
}

export interface IRefreshTokenRepository {
  create(
    data: CreateRefreshTokenData
  ): Promise<RefreshToken>;

  findByToken(
    token: string
  ): Promise<RefreshToken | null>;

  deleteByToken(
    token: string
  ): Promise<void>;

  deleteAllByUserId(
    userId: number
  ): Promise<void>;

  deleteExpiredTokens(): Promise<void>;
}