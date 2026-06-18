import { IResidentRepository } from "../../domain/repositories/IResidentRepository";
import { IUserRepository } from "../../../auth/domain/repositories/IUserRepository";
import { IPasswordHasher } from "../../../auth/domain/services/IPasswordHasher";
import { CreateResidentDto } from "../dtos/CreateResidentDto";
import { Resident } from "../../domain/entities/Resident";
import { User, UserRole } from "../../../auth/domain/entities/User";
import { UserAlreadyExistsError } from "../../../auth/domain/errors/AuthErrors";
import { ResidentAlreadyExistsError } from "../../domain/errors/ResidentErrors";

export class CreateResidentUseCase {
  constructor(
    private readonly residentRepository: IResidentRepository,
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher
  ) {}

  async execute(dto: CreateResidentDto): Promise<Resident> {
    // 1. Check user with this email doesn't already exist
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new UserAlreadyExistsError();
    }

    // 2. Create the user row with role = RESIDENT
    const passwordHash = await this.passwordHasher.hash(dto.password);
    const userInstance = User.create({
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      passwordHash,
      role: UserRole.RESIDENT,
    });
    const savedUser = await this.userRepository.create(userInstance);

    // 3. Check a resident profile doesn't already exist for this user
    const existingResident = await this.residentRepository.findByUserId(savedUser.id!);
    if (existingResident) {
      throw new ResidentAlreadyExistsError();
    }

    // 4. Create the resident row linked to the saved user
    const residentInstance = Resident.create({
      userId: savedUser.id!,
      apartmentId: dto.apartmentId,
      isOwner: dto.isOwner,
      moveInDate: dto.moveInDate,
    });
    const savedResident = await this.residentRepository.create(residentInstance);

    return savedResident;
  }
}