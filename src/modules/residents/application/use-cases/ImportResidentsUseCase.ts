import crypto from "crypto";
import { PasswordResetTokenModel } from "../../../auth/infrastructure/models/PasswordResetTokenModel";
import { IResidentRepository } from "../../domain/repositories/IResidentRepository";
import { IUserRepository } from "../../../auth/domain/repositories/IUserRepository";
import { IPasswordHasher } from "../../../auth/domain/services/IPasswordHasher";
import { IEmailService } from "../../../auth/domain/services/IEmailService";
import { UserRole, User } from "../../../auth/domain/entities/User";
import { UserModel } from "../../../auth/infrastructure/models/UserModel";
import { ResidentModel } from "../../infrastructure/models/ResidentModel";
import { ApartmentModel } from "../../../apartments/infrastructure/models/ApartmentModel";
import * as XLSX from "xlsx";
import { sequelize } from "../../../../shared/config/db";

export interface FailedImportItem {
  row: number;
  identifier: string;
  reason: string;
}

export interface CreatedResidentEmailItem {
  userId: number;
  name: string;
  email: string;
  unit: string;
  temporaryPassword?: string;
}

export interface ImportResidentsResult {
  successCount: number;
  failedCount: number;
  failedItems: FailedImportItem[];
}

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

export class ImportResidentsUseCase {
  constructor(
    private readonly residentRepository: IResidentRepository,
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly emailService?: IEmailService
  ) { }

  async execute(fileBuffer: Buffer): Promise<ImportResidentsResult> {
    let workbook;
    try {
      workbook = XLSX.read(fileBuffer, { type: "buffer" });
    } catch {
      throw new Error("Invalid Excel file format. Please upload a valid .xlsx or .xls file.");
    }

    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      throw new Error("Excel file is empty and contains no worksheets.");
    }

    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: "" });

    if (rows.length === 0) {
      throw new Error("No data rows found in the uploaded Excel sheet.");
    }

    const failedItems: FailedImportItem[] = [];
    const createdResidents: CreatedResidentEmailItem[] = [];

    // Helper to extract cell values case-insensitively with header variations
    const getCellValue = (row: Record<string, unknown>, candidateKeys: string[]): unknown => {
      const keys = Object.keys(row);
      for (const candidate of candidateKeys) {
        const cleanCandidate = candidate.toLowerCase().replace(/[^a-z0-9]/g, "");
        const matchKey = keys.find(
          (k) => k.trim().toLowerCase().replace(/[^a-z0-9]/g, "") === cleanCandidate
        );
        if (matchKey && row[matchKey] !== undefined && row[matchKey] !== null) {
          const valStr = String(row[matchKey]).trim();
          if (valStr !== "") return row[matchKey];
        }
      }
      return undefined;
    };

    const validRows: {
      rowNum: number;
      name: string;
      email: string;
      password: string;
      phone: string;
      block: string;
      floorNumber: number;
      unitNumber: string;
    }[] = [];

    // 1. Validation & parsing phase
    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];
      const rowNum = index + 2; // Data starts at Row 2

      const rawName = getCellValue(row, ["Name", "name", "Full Name"]);
      const rawEmail = getCellValue(row, ["Email", "email", "Email Address"]);
      const rawPhone = getCellValue(row, ["Phone", "phone", "Mobile", "Contact"]);
      const rawBlock = getCellValue(row, ["Block", "block", "Block Name"]);
      const rawFloor = getCellValue(row, ["Floor Number", "Floor", "floorNumber", "floor"]);
      const rawUnit = getCellValue(row, ["Unit Number", "Unit", "unitNumber", "Flat Number", "unit"]);

      // Skip completely blank rows
      if (rawName === undefined && rawEmail === undefined && rawPhone === undefined && rawBlock === undefined && rawFloor === undefined && rawUnit === undefined) {
        continue;
      }

      const rowErrors: string[] = [];

      // Name Validation
      let name = "";
      if (rawName === undefined || rawName === null) {
        rowErrors.push("Name is required");
      } else {
        name = String(rawName).trim();
        if (name.length < 2 || name.length > 100) {
          rowErrors.push("Name must be between 2 and 100 characters");
        }
      }

      // Email Validation
      let email = "";
      if (rawEmail === undefined || rawEmail === null) {
        rowErrors.push("Email is required");
      } else {
        email = String(rawEmail).trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          rowErrors.push("Please provide a valid email");
        }
      }

      // Phone Validation
      let phone = "";
      if (rawPhone === undefined || rawPhone === null) {
        rowErrors.push("Phone number is required");
      } else {
        const rawPhoneStr = String(rawPhone).trim();
        const cleanedPhone = rawPhoneStr.replace(/[^0-9+]/g, "");
        if (cleanedPhone.length < 7 || cleanedPhone.length > 15) {
          rowErrors.push("Phone number must contain between 7 and 15 digits");
        } else {
          phone = cleanedPhone;
        }
      }

      // Block Validation
      let block = "";
      if (rawBlock === undefined || rawBlock === null) {
        rowErrors.push("Block is required");
      } else {
        block = String(rawBlock).trim().toUpperCase();
      }

      // Floor Number Validation
      let floorNumber = 0;
      if (rawFloor === undefined || rawFloor === null || String(rawFloor).trim() === "") {
        rowErrors.push("Floor Number is required");
      } else {
        floorNumber = Number(rawFloor);
        if (isNaN(floorNumber) || floorNumber < 0 || floorNumber > 200 || !Number.isInteger(floorNumber)) {
          rowErrors.push("Floor Number must be a valid integer between 0 and 200");
        }
      }

      // Unit Number Validation
      let unitNumber = "";
      if (rawUnit === undefined || rawUnit === null || String(rawUnit).trim() === "") {
        rowErrors.push("Unit Number is required");
      } else {
        const rawUnitStr = String(rawUnit).trim();
        const unitNum = Number(rawUnitStr);
        if (!isNaN(unitNum) && Number.isInteger(unitNum) && unitNum > 0) {
          unitNumber = String(unitNum).padStart(2, "0");
        } else {
          unitNumber = rawUnitStr;
        }
      }

      if (rowErrors.length > 0) {
        failedItems.push({
          row: rowNum,
          identifier: email || name || `Row #${rowNum}`,
          reason: rowErrors.join("; "),
        });
      } else {
        const generatedPassword = generateRandomPassword(11);
        validRows.push({
          rowNum,
          name,
          email,
          password: generatedPassword,
          phone,
          block,
          floorNumber,
          unitNumber,
        });
      }
    }

    // Deduplication check within Excel file
    const emailsInFile = new Set<string>();
    const unitsInFile = new Map<string, number>();

    const fileDuplicateRows = new Set<number>();

    for (const row of validRows) {
      if (emailsInFile.has(row.email)) {
        failedItems.push({
          row: row.rowNum,
          identifier: row.email,
          reason: "Duplicate email address found in the uploaded Excel file",
        });
        fileDuplicateRows.add(row.rowNum);
      } else {
        emailsInFile.add(row.email);
      }

      const unitKey = `${row.block}-${row.floorNumber}${row.unitNumber}`;
      if (unitsInFile.has(unitKey)) {
        failedItems.push({
          row: row.rowNum,
          identifier: unitKey,
          reason: `Duplicate unit (${unitKey}) assignment found in the uploaded Excel file (First seen on Row #${unitsInFile.get(unitKey)})`,
        });
        fileDuplicateRows.add(row.rowNum);
      } else {
        unitsInFile.set(unitKey, row.rowNum);
      }
    }

    // Filter out duplicates within the file
    const uniqueValidRows = validRows.filter(r => !fileDuplicateRows.has(r.rowNum));

    let successCount = 0;
    const transaction = await sequelize.transaction();
    try {
      for (const row of uniqueValidRows) {
        // 1. Resolve Apartment FIRST — ensure unit exists in database
        const apartment = await ApartmentModel.findOne({
          where: {
            block: row.block,
            floorNumber: row.floorNumber,
            unitNumber: row.unitNumber,
          },
          transaction,
        });

        if (!apartment) {
          failedItems.push({
            row: row.rowNum,
            identifier: `${row.block}-${row.floorNumber}${row.unitNumber}`,
            reason: `Apartment unit does not exist in database`,
          });
          continue;
        }

        // 2. Verify Apartment is not occupied
        const existingActiveResident = await this.residentRepository.findActiveByApartmentId(apartment.id);
        if (existingActiveResident) {
          failedItems.push({
            row: row.rowNum,
            identifier: `${row.block}-${row.floorNumber}${row.unitNumber}`,
            reason: `Apartment unit is already occupied by an active resident`,
          });
          continue;
        }

        // 3. Check if a user with this email already exists
        const existingUser = await this.userRepository.findByEmail(row.email);

        if (existingUser && existingUser.isActive) {
          failedItems.push({
            row: row.rowNum,
            identifier: row.email,
            reason: `User with this email already exists and is active`,
          });
          continue;
        }

        // 4. Create or Reactivate User ONLY AFTER Apartment existence and vacancy are confirmed
        let createdUser: User | UserModel;

        if (existingUser && !existingUser.isActive) {
          // Dormant user — reactivate and reuse their account with auto-generated password
          const passwordHash = await this.passwordHasher.hash(row.password);
          existingUser.updatePassword(passwordHash);
          existingUser.updateName(row.name);
          existingUser.updatePhone(row.phone);
          existingUser.reactivate();
          existingUser.requirePasswordReset();
          createdUser = await this.userRepository.update(existingUser);
        } else {
          // No existing user — create new with auto-generated password
          const passwordHash = await this.passwordHasher.hash(row.password);
          createdUser = await UserModel.create(
            {
              name: row.name,
              email: row.email,
              phone: row.phone,
              passwordHash,
              role: UserRole.RESIDENT,
              mustResetPassword: true,
            },
            { transaction }
          );
        }

        // 5. Create Resident
        await ResidentModel.create(
          {
            userId: createdUser.id!,
            apartmentId: apartment.id,
            isOwner: true,
            isCommitteeMember: false,
            isOccupant: true,
            moveInDate: new Date(),
            isActive: true,
          },
          { transaction }
        );
        successCount++;

        const unitName = `${row.block}-${row.floorNumber}${row.unitNumber}`;
        createdResidents.push({
          userId: createdUser.id!,
          name: row.name,
          email: row.email,
          unit: unitName,
          temporaryPassword: row.password,
        });
      }
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }

    // 6. Send welcome credentials emails directly inside Use Case (Background dispatch)
    if (this.emailService && createdResidents.length > 0) {
      const societyName = process.env.SOCIETY_NAME || "Civic Horizon";
      const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

      for (const item of createdResidents) {
        (async () => {
          try {
            const rawToken = crypto.randomBytes(32).toString("hex");
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

            await PasswordResetTokenModel.destroy({ where: { userId: item.userId } });
            await PasswordResetTokenModel.create({ userId: item.userId, token: rawToken, expiresAt });

            const resetLink = `${clientUrl}/reset-password?token=${rawToken}`;
            const htmlContent = `
              <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 30px; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                  <div style="background-color: #1a1f36; padding: 24px; text-align: center;">
                    <h2 style="color: #ffffff; margin: 0; font-size: 22px;">Welcome to ${societyName}!</h2>
                  </div>
                  <div style="padding: 30px;">
                    <p style="font-size: 16px; margin-top: 0;">Hello <strong>${item.name}</strong>,</p>
                    <p style="font-size: 15px; color: #555;">
                      An account has been created for you as a resident of unit <strong>${item.unit}</strong> at ${societyName}.
                    </p>
                    
                    <div style="background-color: #f8f9fa; border-left: 4px solid #1a1f36; padding: 16px; margin: 24px 0; border-radius: 4px;">
                      <p style="margin: 0 0 8px 0; font-size: 14px; color: #666;"><strong>Your Login Credentials:</strong></p>
                      <p style="margin: 0 0 6px 0; font-size: 15px;"><strong>Email:</strong> ${item.email}</p>
                      <p style="margin: 0; font-size: 15px;"><strong>Temporary Password:</strong> <span style="font-family: monospace; background: #e9ecef; padding: 2px 6px; border-radius: 4px; font-weight: bold; color: #1a1f36;">${item.temporaryPassword}</span></p>
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

            await this.emailService!.sendEmail({
              to: item.email,
              subject: `Welcome to ${societyName} - Your Account Credentials & Reset Password`,
              html: htmlContent,
            });
          } catch (err) {
            console.error(`[ImportResidentsUseCase] Failed to send welcome email to ${item.email}:`, err);
          }
        })();
      }
    }

    return {
      successCount,
      failedCount: failedItems.length,
      failedItems,
    };
  }
}
