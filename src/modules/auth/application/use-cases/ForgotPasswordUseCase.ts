import crypto from "crypto";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { IPasswordResetTokenRepository } from "../../domain/repositories/IPasswordResetTokenRepository";
import { IEmailService } from "../../domain/services/IEmailService";
import { ForgotPasswordDto } from "../dtos/ForgotPasswordDto";
import { PasswordResetToken } from "../../domain/entities/PasswordResetToken";
import { env } from "../../../../shared/config/env";

export class ForgotPasswordUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordResetTokenRepository: IPasswordResetTokenRepository,
    private readonly emailService: IEmailService
  ) {}

  async execute(dto: ForgotPasswordDto): Promise<void> {
    // 1. Find user by email
    const user = await this.userRepository.findByEmail(dto.email);

    // 2. If user not found — return silently
    // never reveal whether email exists or not for security
    if (!user || !user.isActive) return;

    // 3. Delete any existing token for this user
    await this.passwordResetTokenRepository.deleteByUserId(user.id!);

    // 4. Generate secure random token
    const rawToken = crypto.randomBytes(32).toString("hex");

    // 5. Create token entity with 30 min expiry
    const tokenEntity = PasswordResetToken.create(user.id!, rawToken);

    // 6. Save token to DB
    await this.passwordResetTokenRepository.create(tokenEntity);

    // 7. Build reset link
    const resetLink = `${env.CLIENT_URL}/reset-password?token=${rawToken}`;

    // 8. Send email
    console.log(`Password reset link for ${user.email}: ${resetLink}`);
    await this.emailService.sendEmail({
      to: user.email,
      subject: "Reset your password — Civic Horizon",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #111827;">Reset your password</h2>
          <p style="color: #6b7280;">
            You requested a password reset for your Civic Horizon account.
            Click the button below to set a new password.
            This link expires in <strong>30 minutes</strong>.
          </p>
          <a href="${resetLink}"
            style="display: inline-block; background: #111827; color: #fff;
                   padding: 12px 24px; border-radius: 8px; text-decoration: none;
                   font-weight: 600; margin: 16px 0;">
            Reset Password
          </a>
          <p style="color: #9ca3af; font-size: 0.85rem;">
            If you didn't request this, you can safely ignore this email.
          </p>
          <p style="color: #9ca3af; font-size: 0.85rem;">
            Or copy this link: <a href="${resetLink}">${resetLink}</a>
          </p>
        </div>
      `,
    });
  }
}