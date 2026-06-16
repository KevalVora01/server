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

  async execute(userId: number): Promise<UserResponseDto> {
    // 1. Fetch user from infrastructure via the Repository contract
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new UserNotFoundError();
    }

    // 2. Domain check: Prevent inactive accounts from querying details
    if (!user.isActive) {
      throw new InactiveUserError();
    }

    // 3. Transformation: Use the entity's built-in conversion method.
    return user.toResponseObject();
  }
}