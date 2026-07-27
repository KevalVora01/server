import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { IPasswordHasher } from "../../domain/services/IPasswordHasher";
import { CreateUserDto } from "../dtos/CreateUserDto";
import { User } from "../../domain/entities/User";
import { UserAlreadyExistsError } from "../../domain/errors/AuthErrors";

export class CreateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher
  ) {}

  async execute(dto: CreateUserDto): Promise<User> {
    // 1. Business Check: Ensure the user doesn't already exist in our system
    const existingUser = await this.userRepository.findByEmail(dto.email);

    if (existingUser) {
      throw new UserAlreadyExistsError();
    }

    // 2. Encryption: Hash the password using our injected domain utility
    const passwordHash = await this.passwordHasher.hash(dto.password);

    // 3. Entity Instantiation: Create a formal User class instance via the factory method
    // This automatically sets defaults like isActive = true and current timestamps!
    const userInstance = User.create({
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      passwordHash,
      role: dto.role,
    });

    // 4. Persistence: Pass the complete class instance down to the repository layer
    const savedUser = await this.userRepository.create(userInstance);

    return savedUser;
  }
}