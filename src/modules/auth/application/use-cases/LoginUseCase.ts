import { LoginDto } from "../dtos/LoginDto";
import { AuthResponseDto } from "../dtos/AuthResponseDto";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { IRefreshTokenRepository } from "../../domain/repositories/IRefreshTokenRepository";
import { IPasswordHasher } from "../../domain/services/IPasswordHasher";
import { ITokenService, TokenPayload } from "../../domain/services/ITokenService";
import { RefreshToken } from "../../domain/entities/RefreshToken";
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
    // 1. Core Lookup: Look up the user profile by email address
    const user = await this.userRepository.findByEmail(dto.email);

    if (!user) {
      throw new InvalidCredentialsError();
    }

    // 2. Domain Validation: Ensure the target user account isn't locked out or deleted
    if (!user.isActive) {
      throw new InactiveUserError();
    }

    // 3. Cryptography: Compare plain text inputs with stored Argon2/Bcrypt hash
    const passwordMatches = await this.passwordHasher.compare(
      dto.password,
      user.passwordHash
    );

    if (!passwordMatches) {
      throw new InvalidCredentialsError();
    }

    // 4. Role-Based Access Control: Verify the user is logging in with the correct role
    if (user.role !== dto.role) throw new InvalidCredentialsError();

    // 5. Token Provisioning: Package user details into structural payload signatures
    const payload: TokenPayload = {
      userId: user.id!, // Explicit non-null assertion confirms the DB primary key exists
      email: user.email,
      role: user.role,
    };

    const accessToken = this.tokenService.generateAccessToken(payload);
    const refreshTokenString = this.tokenService.generateRefreshToken(payload);

    const refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 Days Lifespan

    // 6. Entity Instantiation: Wrap raw parameters into a true Domain Entity instance
    const refreshTokenInstance = RefreshToken.create({
      userId: user.id!,
      token: refreshTokenString,
      expiresAt: refreshTokenExpiresAt,
    });

    // 7. Persistence: Pass the completed Entity class instance down to your repository
    await this.refreshTokenRepository.create(refreshTokenInstance);

    // 8. Transformation: Map output layers cleanly using domain methods
    return {
      refreshToken: refreshTokenString,
      authResponse: {
        accessToken,
        user: user.toResponseObject(),
      },
    };
  }
}