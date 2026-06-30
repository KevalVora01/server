import { IResidentRepository } from "../../domain/repositories/IResidentRepository";
import { IUserRepository } from "../../../auth/domain/repositories/IUserRepository";
import { IPasswordHasher } from "../../../auth/domain/services/IPasswordHasher";
import { CreateResidentDto } from "../dtos/CreateResidentDto";
import { Resident } from "../../domain/entities/Resident";
import { User, UserRole } from "../../../auth/domain/entities/User";
import { UserAlreadyExistsError } from "../../../auth/domain/errors/AuthErrors";
import { ApartmentAlreadyOccupiedError } from "../../domain/errors/ResidentErrors";

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

    // 2. Check apartment doesn't already have an active resident
    if (dto.apartmentId) {
      const existingActiveResident = await this.residentRepository.findActiveByApartmentId(dto.apartmentId);
      if (existingActiveResident) {
        throw new ApartmentAlreadyOccupiedError();
      }
    }

    // 3. Create the user row with role = RESIDENT
    const passwordHash = await this.passwordHasher.hash(dto.password);
    const userInstance = User.create({
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      passwordHash,
      role: UserRole.RESIDENT,
    });
    const savedUser = await this.userRepository.create(userInstance);

    // 4. Create the resident row — moveInDate auto-set to today
    const residentInstance = Resident.create({
      userId: savedUser.id!,
      apartmentId: dto.apartmentId,
      isOwner: dto.isOwner,
      moveInDate: new Date(),
    });
    const savedResident = await this.residentRepository.create(residentInstance);

    return savedResident;
  }
}