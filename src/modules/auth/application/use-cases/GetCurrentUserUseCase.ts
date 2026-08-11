import crypto from "crypto";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { IResidentRepository } from "../../../residents/domain/repositories/IResidentRepository";
import { UserResponseDto } from "../dtos/UserResponseDto";
import { UserNotFoundError, InactiveUserError } from "../../domain/errors/AuthErrors";
import { PasswordResetTokenModel } from "../../infrastructure/models/PasswordResetTokenModel";

export class GetCurrentUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly residentRepository: IResidentRepository,
  ) { }

  async execute(userId: number): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new UserNotFoundError();
    if (!user.isActive) throw new InactiveUserError();

    // If user must reset password, resolve or generate a reset token
    let resetToken: string | undefined = undefined;
    if (user.mustResetPassword && user.id) {
      let existing = await PasswordResetTokenModel.findOne({
        where: { userId: user.id },
      });

      if (!existing || existing.expiresAt < new Date()) {
        const rawToken = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        await PasswordResetTokenModel.destroy({
          where: { userId: user.id },
        });

        existing = await PasswordResetTokenModel.create({
          userId: user.id,
          token: rawToken,
          expiresAt,
        });
      }

      resetToken = existing.token;
    }

    // resident lookup
    const resident = await this.residentRepository.findByUserId(userId);

    return {
      ...user.toResponseObject(),
      resetToken,
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
    };
  }
}