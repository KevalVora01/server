import crypto from "crypto";
import { PasswordResetTokenModel } from "../../../auth/infrastructure/models/PasswordResetTokenModel";
import { ApartmentModel } from "../../../apartments/infrastructure/models/ApartmentModel";
import { IEmailService } from "../../../auth/domain/services/IEmailService";
import { IResidentRepository } from "../../domain/repositories/IResidentRepository";
import { IUserRepository } from "../../../auth/domain/repositories/IUserRepository";
import { IPasswordHasher } from "../../../auth/domain/services/IPasswordHasher";
import { CreateResidentDto } from "../dtos/CreateResidentDto";
import { Resident } from "../../domain/entities/Resident";
import { User, UserRole } from "../../../auth/domain/entities/User";
import { UserAlreadyExistsError } from "../../../auth/domain/errors/AuthErrors";
import { ApartmentAlreadyOccupiedError } from "../../domain/errors/ResidentErrors";
import { buildWelcomeEmailTemplate } from "../templates/welcomeEmailTemplate";
import { generateRandomPassword } from "../../../../shared/utils/generateRandomPassword";

export class CreateResidentUseCase {
  constructor(
    private readonly residentRepository: IResidentRepository,
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly emailService?: IEmailService
  ) { }

  async execute(dto: CreateResidentDto): Promise<Resident> {
    // 1. Verify Apartment exists and is not occupied FIRST
    let apartment: ApartmentModel | null = null;
    if (dto.apartmentId) {
      apartment = await ApartmentModel.findByPk(dto.apartmentId);
      if (!apartment) {
        throw new Error("Selected apartment unit does not exist in database");
      }

      const existingActiveResident = await this.residentRepository.findActiveByApartmentId(dto.apartmentId);
      if (existingActiveResident) {
        throw new ApartmentAlreadyOccupiedError();
      }
    }

    // 2. Check if a user with this email already exists
    const existingUser = await this.userRepository.findByEmail(dto.email);

    if (existingUser && existingUser.isActive) {
      throw new UserAlreadyExistsError();
    }

    const rawPassword = dto.password || generateRandomPassword(11);
    const passwordHash = await this.passwordHasher.hash(rawPassword);

    let savedUser: User;

    if (existingUser && !existingUser.isActive) {
      // Dormant user exists — reactivate and reuse their account
      existingUser.updatePassword(passwordHash);
      existingUser.updateName(dto.name);
      existingUser.updatePhone(dto.phone);
      existingUser.reactivate();
      existingUser.requirePasswordReset();
      savedUser = await this.userRepository.update(existingUser);
    } else {
      // No existing user — create a new one
      const userInstance = User.create({
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        passwordHash,
        role: UserRole.RESIDENT,
        mustResetPassword: true,
      });
      savedUser = await this.userRepository.create(userInstance);
    }

    // 3. Create a new resident row
    const residentInstance = Resident.create({
      userId: savedUser.id!,
      apartmentId: dto.apartmentId,
      isOwner: dto.isOwner ?? true,
      moveInDate: new Date(),
    });
    const savedResident = await this.residentRepository.create(residentInstance);

    // 4. Send Welcome Email with credentials directly inside Use Case
    let unitName = "Your Apartment";
    if (apartment) {
      unitName = `${apartment.block}-${apartment.floorNumber}${apartment.unitNumber}`;
    }

    if (this.emailService && savedUser.id) {
      const { subject, html } = buildWelcomeEmailTemplate({
        name: dto.name,
        email: dto.email,
        unitName,
        temporaryPassword: rawPassword,
      });

      this.emailService.sendEmail({
        to: dto.email,
        subject,
        html,
      }).catch((err) => console.error("[CreateResidentUseCase] Welcome email delivery error:", err));
    }

    return savedResident;
  }
}