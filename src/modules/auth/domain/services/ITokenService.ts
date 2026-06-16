import { UserRole } from "../entities/User";

export interface TokenPayload {
  userId: number;
  email: string;
  role: UserRole;
}

export interface ITokenService {
  generateAccessToken(
    payload: TokenPayload
  ): string;

  generateRefreshToken(
    payload: TokenPayload
  ): string;

  verifyAccessToken(
    token: string
  ): TokenPayload;

  verifyRefreshToken(
    token: string
  ): TokenPayload;
}