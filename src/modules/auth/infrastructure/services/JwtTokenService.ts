import jwt, {
  SignOptions,
  Secret,
} from "jsonwebtoken";

import {
  ITokenService,
  TokenPayload,
} from "../../domain/services/ITokenService";

import { env } from "../../../../shared/config/env";

export class JwtTokenService
  implements ITokenService
{
  generateAccessToken(
    payload: TokenPayload
  ): string {
    return jwt.sign(
      payload,
      env.JWT_ACCESS_SECRET as Secret,
      {
        expiresIn:
          env.JWT_ACCESS_EXPIRES_IN,
      } as SignOptions
    );
  }

  generateRefreshToken(
    payload: TokenPayload
  ): string {
    return jwt.sign(
      payload,
      env.JWT_REFRESH_SECRET as Secret,
      {
        expiresIn:
          env.JWT_REFRESH_EXPIRES_IN,
      } as SignOptions
    );
  }

  verifyAccessToken(
    token: string
  ): TokenPayload {
    return jwt.verify(
      token,
      env.JWT_ACCESS_SECRET
    ) as TokenPayload;
  }

  verifyRefreshToken(
    token: string
  ): TokenPayload {
    return jwt.verify(
      token,
      env.JWT_REFRESH_SECRET
    ) as TokenPayload;
  }
}