import { UserRole } from "../entities/User";

export interface TokenPayload {
  userId: number;
  email: string;
  role: UserRole;
  mustResetPassword: boolean;
}

export interface ITokenService {
  
  generateAccessToken(payload: TokenPayload): string;

  generateRefreshToken(payload: TokenPayload): string;

  verifyAccessToken(token: string): TokenPayload | null;

  verifyRefreshToken(token: string): TokenPayload | null;
}