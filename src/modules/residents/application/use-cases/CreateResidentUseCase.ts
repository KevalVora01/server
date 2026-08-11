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

function generateRandomPassword(length = 11): string {
  const uppercase = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lowercase = "abcdefghijkmnopqrstuvwxyz";
  const numbers = "23456789";
  const symbols = "#!@$%&*";

  const allChars = uppercase + lowercase + numbers + symbols;

  let password = "";
  password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
  password += numbers.charAt(Math.floor(Math.random() * numbers.length));
  password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
  password += symbols.charAt(Math.floor(Math.random() * symbols.length));

  for (let i = password.length; i < length; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }

  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

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
      const rawToken = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await PasswordResetTokenModel.destroy({
        where: { userId: savedUser.id },
      });

      await PasswordResetTokenModel.create({
        userId: savedUser.id,
        token: rawToken,
        expiresAt,
      });

      const societyName = process.env.SOCIETY_NAME || "Civic Horizon";
      const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
      const resetLink = `${clientUrl}/reset-password?token=${rawToken}`;

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 30px; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
            <div style="background-color: #1a1f36; padding: 24px; text-align: center;">
              <h2 style="color: #ffffff; margin: 0; font-size: 22px;">Welcome to ${societyName}!</h2>
            </div>
            <div style="padding: 30px;">
              <p style="font-size: 16px; margin-top: 0;">Hello <strong>${dto.name}</strong>,</p>
              <p style="font-size: 15px; color: #555;">
                An account has been created for you as a resident of unit <strong>${unitName}</strong> at ${societyName}.
              </p>
              
              <div style="background-color: #f8f9fa; border-left: 4px solid #1a1f36; padding: 16px; margin: 24px 0; border-radius: 4px;">
                <p style="margin: 0 0 8px 0; font-size: 14px; color: #666;"><strong>Your Login Credentials:</strong></p>
                <p style="margin: 0 0 6px 0; font-size: 15px;"><strong>Email:</strong> ${dto.email}</p>
                <p style="margin: 0; font-size: 15px;"><strong>Temporary Password:</strong> <span style="font-family: monospace; background: #e9ecef; padding: 2px 6px; border-radius: 4px; font-weight: bold; color: #1a1f36;">${rawPassword}</span></p>
              </div>

              <p style="font-size: 14px; color: #666;">
                You can set your own password directly by clicking the button below, or log in with your temporary password.
              </p>

              <div style="text-align: center; margin: 25px 0 10px 0;">
                <a href="${resetLink}" style="background-color: #1a1f36; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 15px;">
                  Set Your Password Directly
                </a>
              </div>
              <p style="text-align: center; font-size: 13px; color: #777; margin-top: 10px;">
                Or <a href="${clientUrl}/login" style="color: #1a1f36; text-decoration: underline;">log in to your account</a>
              </p>
            </div>
            <div style="background-color: #f1f3f5; padding: 16px; text-align: center; font-size: 12px; color: #888;">
              <p style="margin: 0;">© ${new Date().getFullYear()} ${societyName}. All rights reserved.</p>
            </div>
          </div>
        </div>
      `;

      this.emailService.sendEmail({
        to: dto.email,
        subject: `Welcome to ${societyName} - Your Account Credentials & Reset Password`,
        html: htmlContent,
      }).catch((err) => console.error("[CreateResidentUseCase] Welcome email delivery error:", err));
    }

    return savedResident;
  }
}