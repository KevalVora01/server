import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { IPasswordResetTokenRepository } from "../../domain/repositories/IPasswordResetTokenRepository";
import { IPasswordHasher } from "../../domain/services/IPasswordHasher";
import { ResetPasswordDto } from "../dtos/ResetPasswordDto";

export class ResetPasswordUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordResetTokenRepository: IPasswordResetTokenRepository,
    private readonly passwordHasher: IPasswordHasher
  ) {}

  async execute(dto: ResetPasswordDto): Promise<void> {
    // 1. Find token in DB
    const tokenEntity = await this.passwordResetTokenRepository.findByToken(dto.token);

    // 2. Check token exists
    if (!tokenEntity) {
      throw new Error("Invalid or expired reset token");
    }

    // 3. Check token not expired using domain method
    if (tokenEntity.isExpired()) {
      await this.passwordResetTokenRepository.deleteByToken(dto.token);
      throw new Error("Reset token has expired. Please request a new one.");
    }

    // 4. Find user
    const user = await this.userRepository.findById(tokenEntity.userId);
    if (!user || !user.isActive) {
      throw new Error("User not found or inactive");
    }

    // 5. Hash new password
    const hashedPassword = await this.passwordHasher.hash(dto.newPassword);

    // 6. Update password using domain method
    user.updatePassword(hashedPassword);
    await this.userRepository.update(user);

    // 7. Delete token so it can't be reused
    await this.passwordResetTokenRepository.deleteByToken(dto.token);
  }
}