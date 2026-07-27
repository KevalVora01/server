import { ChangePasswordDto } from "../dtos/ChangePasswordDto";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { IPasswordHasher } from "../../domain/services/IPasswordHasher";
import { AppError } from "../../../../shared/errors/AppError";

export class ChangePasswordUseCase {
  constructor(
    private userRepository: IUserRepository,
    private passwordHasher: IPasswordHasher,
  ) { }

  async execute(userId: number, dto: ChangePasswordDto): Promise<void> {
    const user = await this.userRepository.findById(userId);

    if (!user || !user.isActive) {
      throw new AppError("User not found or inactive", 404);
    }

    const isMatch = await this.passwordHasher.compare(
      dto.currentPassword,
      user.passwordHash
    );

    if (!isMatch) {
      throw new AppError("Current password is incorrect", 400);
    }

    const hashed = await this.passwordHasher.hash(dto.newPassword);
    user.updatePassword(hashed);

    await this.userRepository.update(user);
  }
}