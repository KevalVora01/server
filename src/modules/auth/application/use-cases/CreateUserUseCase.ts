import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { IPasswordHasher } from "../../domain/services/IPasswordHasher";

import { CreateUserDto } from "../dtos/CreateUserDto";

import { User } from "../../domain/entities/User";

import { UserAlreadyExistsError } from "../../domain/errors/AuthErrors";

export class CreateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher
  ) { }

  async execute(dto: CreateUserDto): Promise<User> {
    const existingUser =
      await this.userRepository.findByEmail(
        dto.email
      );

    if (existingUser) {
      throw new UserAlreadyExistsError();
    }

    const passwordHash =
      await this.passwordHasher.hash(
        dto.password
      );

    const user =
      await this.userRepository.create({
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        passwordHash,
        role: dto.role,
      });

    return user;
  }
}