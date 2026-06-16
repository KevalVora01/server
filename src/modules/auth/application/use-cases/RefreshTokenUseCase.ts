import { AuthResponseDto } from "../dtos/AuthResponseDto";

import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { IRefreshTokenRepository } from "../../domain/repositories/IRefreshTokenRepository";

import {
  ITokenService,
  TokenPayload,
} from "../../domain/services/ITokenService";

import {
  InvalidRefreshTokenError,
  RefreshTokenNotFoundError,
  UserNotFoundError,
} from "../../domain/errors/AuthErrors";

export class RefreshTokenUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly tokenService: ITokenService
  ) {}

  async execute(
    refreshToken: string
  ): Promise<{
    authResponse: AuthResponseDto;
    refreshToken: string;
  }> {
    if (!refreshToken) {
      throw new InvalidRefreshTokenError();
    }

    let payload: TokenPayload;

    try {
      payload =
        this.tokenService.verifyRefreshToken(
          refreshToken
        );
    } catch {
      throw new InvalidRefreshTokenError();
    }

    const storedToken =
      await this.refreshTokenRepository.findByToken(
        refreshToken
      );

    if (!storedToken) {
      throw new RefreshTokenNotFoundError();
    }

    if (storedToken.isExpired()) {
      await this.refreshTokenRepository.deleteByToken(
        refreshToken
      );

      throw new InvalidRefreshTokenError();
    }

    const user =
      await this.userRepository.findById(
        payload.userId
      );

    if (!user) {
      throw new UserNotFoundError();
    }

    if (!user.isActive) {
      throw new InvalidRefreshTokenError();
    }

    const newPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const newAccessToken =
      this.tokenService.generateAccessToken(
        newPayload
      );

    const newRefreshToken =
      this.tokenService.generateRefreshToken(
        newPayload
      );

    // Refresh Token Rotation
    await this.refreshTokenRepository.deleteByToken(
      refreshToken
    );

    await this.refreshTokenRepository.create({
      userId: user.id,
      token: newRefreshToken,
      expiresAt: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ),
    });

    return {
      refreshToken: newRefreshToken,

      authResponse: {
        accessToken: newAccessToken,

        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      },
    };
  }
}