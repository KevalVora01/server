import { IUserRepository } from "../../domain/repositories/IUserRepository";

import { UserResponseDto } from "../dtos/UserResponseDto";

import {
  UserNotFoundError,
  InactiveUserError,
} from "../../domain/errors/AuthErrors";

export class GetCurrentUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository
  ) {}

  async execute(
    userId: number
  ): Promise<UserResponseDto> {
    const user =
      await this.userRepository.findById(userId);

    if (!user) {
      throw new UserNotFoundError();
    }

    if (!user.isActive) {
      throw new InactiveUserError();
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    };
  }
}