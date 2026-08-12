import crypto from "crypto";
import { LoginDto } from "../dtos/LoginDto";
import { AuthResponseDto } from "../dtos/AuthResponseDto";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { IRefreshTokenRepository } from "../../domain/repositories/IRefreshTokenRepository";
import { IPasswordHasher } from "../../domain/services/IPasswordHasher";
import { ITokenService, TokenPayload } from "../../domain/services/ITokenService";
import { RefreshToken } from "../../domain/entities/RefreshToken";
import { UserRole } from "../../domain/entities/User";
import { PasswordResetTokenModel } from "../../infrastructure/models/PasswordResetTokenModel";
import {
  InvalidCredentialsError,
  InactiveUserError,
} from "../../domain/errors/AuthErrors";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
    const isEmail = EMAIL_PATTERN.test(dto.identifier);

    // 1. Core Lookup: resolve by email or phone depending on the identifier's shape
    const user = isEmail
      ? await this.userRepository.findByEmail(dto.identifier)
      : await this.userRepository.findByPhone(dto.identifier);

    if (!user) {
      throw new InvalidCredentialsError();
    }

    // 2. Phone login is Resident-only
    if (!isEmail && user.role !== UserRole.RESIDENT) {
      throw new InvalidCredentialsError();
    }

    // 3. Domain Validation
    if (!user.isActive) {
      throw new InactiveUserError();
    }

    // 4. Cryptography
    const passwordMatches = await this.passwordHasher.compare(
      dto.password,
      user.passwordHash
    );

    if (!passwordMatches) {
      throw new InvalidCredentialsError();
    }

    // If user must reset password (temporary password), generate password reset token for redirect link
    let resetToken: string | undefined = undefined;
    if (user.mustResetPassword && user.id) {
      const rawToken = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await PasswordResetTokenModel.destroy({
        where: { userId: user.id },
      });

      await PasswordResetTokenModel.create({
        userId: user.id,
        token: rawToken,
        expiresAt,
      });

      resetToken = rawToken;
    }

    // 5. Token Provisioning — role comes exclusively from the database record
    const payload: TokenPayload = {
      userId: user.id!,
      email: user.email,
      role: user.role,
      mustResetPassword: user.mustResetPassword,
    };

    const accessToken = this.tokenService.generateAccessToken(payload);
    const refreshTokenString = this.tokenService.generateRefreshToken(payload);

    const refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const refreshTokenInstance = RefreshToken.create({
      userId: user.id!,
      token: refreshTokenString,
      expiresAt: refreshTokenExpiresAt,
    });

    await this.refreshTokenRepository.create(refreshTokenInstance);

    return {
      refreshToken: refreshTokenString,
      authResponse: {
        accessToken,
        user: {
          ...user.toResponseObject(),
          resetToken,
        },
      },
    };
  }
}