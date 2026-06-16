import { LoginDto } from "../dtos/LoginDto";
import { AuthResponseDto } from "../dtos/AuthResponseDto";

import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { IRefreshTokenRepository } from "../../domain/repositories/IRefreshTokenRepository";

import { IPasswordHasher } from "../../domain/services/IPasswordHasher";
import {
  ITokenService,
  TokenPayload,
} from "../../domain/services/ITokenService";

import {
  InvalidCredentialsError,
  InactiveUserError,
} from "../../domain/errors/AuthErrors";

export class LoginUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly tokenService: ITokenService
  ) { }

  async execute(
    dto: LoginDto
  ): Promise<{
    authResponse: AuthResponseDto;
    refreshToken: string;
  }> {
    const user = await this.userRepository.findByEmail(
      dto.email
    );

    if (!user) {
      throw new InvalidCredentialsError();
    }

    if (!user.isActive) {
      throw new InactiveUserError();
    }

    const passwordMatches =
      await this.passwordHasher.compare(
        dto.password,
        user.passwordHash
      );

    if (!passwordMatches) {
      throw new InvalidCredentialsError();
    }

    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken =
      this.tokenService.generateAccessToken(
        payload
      );

    const refreshToken =
      this.tokenService.generateRefreshToken(
        payload
      );

    const refreshTokenExpiresAt =
      new Date(
        Date.now() +
        7 * 24 * 60 * 60 * 1000
      );

    await this.refreshTokenRepository.create({
      userId: user.id,
      token: refreshToken,
      expiresAt: refreshTokenExpiresAt,
    });

    return {
      refreshToken,

      authResponse: {
        accessToken,

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