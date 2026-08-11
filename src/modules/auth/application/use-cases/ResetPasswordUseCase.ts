import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { IPasswordResetTokenRepository } from "../../domain/repositories/IPasswordResetTokenRepository";
import { IRefreshTokenRepository } from "../../domain/repositories/IRefreshTokenRepository";
import { IPasswordHasher } from "../../domain/services/IPasswordHasher";
import { ITokenService, TokenPayload } from "../../domain/services/ITokenService";
import { RefreshToken } from "../../domain/entities/RefreshToken";
import { ResetPasswordDto } from "../dtos/ResetPasswordDto";
import { ExpiredResetTokenError, InvalidResetTokenError, UserNotFoundError } from "../../domain/errors/AuthErrors";
import { UserResponseDto } from "../dtos/UserResponseDto";
import { IResidentRepository } from "../../../residents/domain/repositories/IResidentRepository";

export interface ResetPasswordResult {
  accessToken: string;
  refreshToken: string;
  user: UserResponseDto;
}

export class ResetPasswordUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordResetTokenRepository: IPasswordResetTokenRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly tokenService: ITokenService,
    private readonly residentRepository?: IResidentRepository
  ) { }

  async execute(dto: ResetPasswordDto): Promise<ResetPasswordResult> {
    // 1. Find token in DB
    const tokenEntity = await this.passwordResetTokenRepository.findByToken(dto.token);

    // 2. Check token exists
    if (!tokenEntity) {
      throw new InvalidResetTokenError();
    }

    // 3. Check token not expired using domain method
    if (tokenEntity.isExpired()) {
      await this.passwordResetTokenRepository.deleteByToken(dto.token);
      throw new ExpiredResetTokenError();
    }

    // 4. Find user
    const user = await this.userRepository.findById(tokenEntity.userId);
    if (!user || !user.isActive) {
      throw new UserNotFoundError();
    }

    // 5. Hash new password
    const hashedPassword = await this.passwordHasher.hash(dto.newPassword);

    // 6. Update password using domain method
    user.updatePassword(hashedPassword);
    user.clearPasswordReset();
    const updatedUser = await this.userRepository.update(user);

    // 7. Delete token so it can't be reused
    await this.passwordResetTokenRepository.deleteByToken(dto.token);

    // 8. Provision fresh session tokens (mustResetPassword: false)
    const payload: TokenPayload = {
      userId: updatedUser.id!,
      email: updatedUser.email,
      role: updatedUser.role,
      mustResetPassword: false,
    };

    const accessToken = this.tokenService.generateAccessToken(payload);
    const refreshTokenString = this.tokenService.generateRefreshToken(payload);

    const refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const refreshTokenInstance = RefreshToken.create({
      userId: updatedUser.id!,
      token: refreshTokenString,
      expiresAt: refreshTokenExpiresAt,
    });

    await this.refreshTokenRepository.create(refreshTokenInstance);

    // 9. Lookup resident record so returned user object contains full resident details
    let resident = null;
    if (this.residentRepository) {
      resident = await this.residentRepository.findByUserId(updatedUser.id!);
    }

    return {
      accessToken,
      refreshToken: refreshTokenString,
      user: {
        ...updatedUser.toResponseObject(),
        residentId: resident?.id ?? null,
        resident: resident
          ? {
              id: resident.id!,
              isOwner: resident.isOwner,
              isOccupant: resident.isOccupant,
              moveInDate: resident.moveInDate,
              apartmentId: resident.apartmentId,
            }
          : null,
      },
    };
  }
}