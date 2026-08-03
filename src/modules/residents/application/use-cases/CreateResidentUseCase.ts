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
  ) { }

  async execute(dto: CreateResidentDto): Promise<Resident> {
    // 1. Check if a user with this email already exists
    const existingUser = await this.userRepository.findByEmail(dto.email);

    if (existingUser && existingUser.isActive) {
      throw new UserAlreadyExistsError();
    }

    let savedUser: User;

    if (existingUser && !existingUser.isActive) {
      // 2a. Dormant user exists — reactivate and reuse their account
      const passwordHash = await this.passwordHasher.hash(dto.password);
      existingUser.updatePassword(passwordHash);
      existingUser.updateName(dto.name);
      existingUser.updatePhone(dto.phone);
      existingUser.reactivate();
      existingUser.requirePasswordReset();
      savedUser = await this.userRepository.update(existingUser);
    } else {
      // 2b. No existing user — create a new one
      const passwordHash = await this.passwordHasher.hash(dto.password);
      const userInstance = User.create({
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        passwordHash,
        role: UserRole.RESIDENT,
      });
      savedUser = await this.userRepository.create(userInstance);
    }

    // 3. Check apartment doesn't already have an active resident
    if (dto.apartmentId) {
      const existingActiveResident = await this.residentRepository.findActiveByApartmentId(dto.apartmentId);
      if (existingActiveResident) {
        throw new ApartmentAlreadyOccupiedError();
      }
    }

    // 4. Create a new resident row — always create fresh, even if user was reused.
    //    The old deactivated resident record stays untouched as historical data.
    //    Admin-created residents are always owners by default.
    const residentInstance = Resident.create({
      userId: savedUser.id!,
      apartmentId: dto.apartmentId,
      isOwner: true,
      moveInDate: new Date(),
    });
    const savedResident = await this.residentRepository.create(residentInstance);

    return savedResident;
  }
}