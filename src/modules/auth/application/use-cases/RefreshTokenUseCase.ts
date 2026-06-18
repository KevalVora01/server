import { AuthResponseDto } from "../dtos/AuthResponseDto";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { IRefreshTokenRepository } from "../../domain/repositories/IRefreshTokenRepository";
import { ITokenService, TokenPayload } from "../../domain/services/ITokenService";
import { RefreshToken } from "../../domain/entities/RefreshToken"; 
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
    // 1. Structural Check: Confirm a token string was actually provided
    if (!refreshToken) {
      throw new InvalidRefreshTokenError();
    }

    // 2. Cryptographic Parse: Cleanly evaluate the signature without heavy try/catch wrappers
    const payload = this.tokenService.verifyRefreshToken(refreshToken);
    
    if (!payload) {
      throw new InvalidRefreshTokenError();
    }

    // 3. Database Check: Match incoming token string against active persistence rows
    const storedToken = await this.refreshTokenRepository.findByToken(refreshToken);

    if (!storedToken) {
      throw new RefreshTokenNotFoundError();
    }

    // 4. Expiry Validation: Purge the token if its lifespan has natively lapsed
    if (storedToken.isExpired()) {
      await this.refreshTokenRepository.deleteByToken(refreshToken);
      throw new InvalidRefreshTokenError();
    }

    // 5. Account Evaluation: Identify the owning user account
    const user = await this.userRepository.findById(payload.userId);

    if (!user) {
      throw new UserNotFoundError();
    }

    if (!user.isActive) {
      throw new InvalidRefreshTokenError();
    }

    // 6. Token Generation: Fabricate fresh rotational payloads
    const newPayload: TokenPayload = {
      userId: user.id!, //  Explicit non-null assertion resolves the compilation type check
      email: user.email,
      role: user.role,
    };

    const newAccessToken = this.tokenService.generateAccessToken(newPayload);
    const newRefreshTokenString = this.tokenService.generateRefreshToken(newPayload);

    // 7. Refresh Token Rotation (RTR): Invalidate the old token and register the new one
    await this.refreshTokenRepository.deleteByToken(refreshToken);

    const refreshTokenInstance = RefreshToken.create({
      userId: user.id!,
      token: newRefreshTokenString,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 Days Lifespan
    });

    await this.refreshTokenRepository.create(refreshTokenInstance);

    // 8. Output Mapping
    return {
      refreshToken: newRefreshTokenString,
      authResponse: {
        accessToken: newAccessToken,
        user: user.toResponseObject(), 
      },
    };
  }
}