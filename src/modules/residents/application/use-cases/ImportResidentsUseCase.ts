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
import { buildWelcomeEmailTemplate } from "../templates/welcomeEmailTemplate";
import { importResidentRowSchema } from "../../presentation/validators/residentValidators";

export interface FailedImportItem {
  row: number;
  identifier: string;
  reason: string;
}

export interface CreatedResidentEmailItem {
  userId: number;
  email: string;
  name: string;
  unit: string;
  temporaryPassword?: string;
  status: "pending" | "sending" | "sent" | "failed";
  error?: string;
}

export interface ImportResidentsResult {
  successCount: number;
  failedCount: number;
  failedItems: FailedImportItem[];
  createdResidents?: CreatedResidentEmailItem[];
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

    // 1. Validation & parsing phase using Joi schema
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

      let rawUnitStr = rawUnit !== undefined && rawUnit !== null ? String(rawUnit).trim() : undefined;
      if (rawUnitStr?.endsWith(".0")) rawUnitStr = rawUnitStr.slice(0, -2);
      if (rawUnitStr && /^\d+$/.test(rawUnitStr)) {
        const uInt = parseInt(rawUnitStr, 10);
        if (uInt > 0) rawUnitStr = String(uInt).padStart(2, "0");
      }

      const candidate = {
        name: rawName !== undefined && rawName !== null ? String(rawName).trim() : undefined,
        email: rawEmail !== undefined && rawEmail !== null ? String(rawEmail).trim().toLowerCase() : undefined,
        phone: rawPhone !== undefined && rawPhone !== null ? String(rawPhone).trim().replace(/[^0-9+]/g, "") : undefined,
        block: rawBlock !== undefined && rawBlock !== null ? String(rawBlock).trim().toUpperCase() : undefined,
        floorNumber: rawFloor !== undefined && rawFloor !== null && String(rawFloor).trim() !== "" ? Number(String(rawFloor).trim()) : undefined,
        unitNumber: rawUnitStr,
      };

      // Validate row via Joi schema
      const { error, value } = importResidentRowSchema.validate(candidate, { abortEarly: false });

      if (error) {
        failedItems.push({
          row: rowNum,
          identifier: candidate.email || candidate.name || `Row #${rowNum}`,
          reason: error.details.map((d) => d.message).join("; "),
        });
      } else {
        const generatedPassword = generateRandomPassword(11);
        validRows.push({
          rowNum,
          name: value.name,
          email: value.email,
          password: generatedPassword,
          phone: value.phone,
          block: value.block,
          floorNumber: value.floorNumber,
          unitNumber: value.unitNumber,
        });
      }
    }

    if (validRows.length === 0) {
      return {
        successCount: 0,
        failedCount: failedItems.length,
        failedItems,
      };
    }

    // 2. Check for duplicate emails within the uploaded file itself
    const seenEmails = new Map<string, number>();
    const uniqueRows: typeof validRows = [];
    for (const item of validRows) {
      if (seenEmails.has(item.email)) {
        const firstRow = seenEmails.get(item.email)!;
        failedItems.push({
          row: item.rowNum,
          identifier: item.email,
          reason: `Duplicate email '${item.email}' in Excel sheet (first seen at Row #${firstRow})`,
        });
      } else {
        seenEmails.set(item.email, item.rowNum);
        uniqueRows.push(item);
      }
    }

    if (uniqueRows.length === 0) {
      return {
        successCount: 0,
        failedCount: failedItems.length,
        failedItems,
      };
    }

    // 3. Batch query database for existing Users and Apartments
    const emailsToQuery = uniqueRows.map((r) => r.email);

    const existingUserModels = await UserModel.findAll({
      where: { email: emailsToQuery },
    });

    const userMapByEmail = new Map<string, UserModel>();
    for (const u of existingUserModels) {
      userMapByEmail.set(u.email.toLowerCase(), u);
    }

    // Fetch all apartments to match block, floorNumber, unitNumber
    const allApartments = await ApartmentModel.findAll();

    const apartmentMap = new Map<string, ApartmentModel>();
    for (const apt of allApartments) {
      const key = `${apt.block.toUpperCase()}-${apt.floorNumber}-${apt.unitNumber.padStart(2, "0")}`;
      apartmentMap.set(key, apt);
    }

    // Fetch all active residents to ensure apartment is not occupied
    const activeResidents = await ResidentModel.findAll({
      where: { isActive: true },
    });

    const occupiedApartmentIds = new Set<number>();
    for (const res of activeResidents) {
      occupiedApartmentIds.add(res.apartmentId);
    }

    // 4. Process each row against database business logic
    const createdResidents: CreatedResidentEmailItem[] = [];
    let successCount = 0;

    for (const item of uniqueRows) {
      const aptKey = `${item.block}-${item.floorNumber}-${item.unitNumber}`;
      const apartment = apartmentMap.get(aptKey);

      // Check 1: Apartment exists
      if (!apartment) {
        failedItems.push({
          row: item.rowNum,
          identifier: item.email,
          reason: `Apartment unit '${item.block}-${item.floorNumber}${item.unitNumber}' does not exist in society`,
        });
        continue;
      }

      // Check 2: Apartment occupied
      if (occupiedApartmentIds.has(apartment.id)) {
        failedItems.push({
          row: item.rowNum,
          identifier: item.email,
          reason: `Apartment unit '${item.block}-${item.floorNumber}${item.unitNumber}' is already occupied by an active resident`,
        });
        continue;
      }

      // Check 3: Active user with same email exists
      const existingUser = userMapByEmail.get(item.email);
      if (existingUser && existingUser.isActive) {
        failedItems.push({
          row: item.rowNum,
          identifier: item.email,
          reason: `An active user with email '${item.email}' already exists in society`,
        });
        continue;
      }

      const passwordHash = await this.passwordHasher.hash(item.password);

      // Database Transaction for per-row consistency
      const transaction = await sequelize.transaction();

      try {
        let createdUser: UserModel;

        if (existingUser && !existingUser.isActive) {
          // Reactivate dormant user
          existingUser.passwordHash = passwordHash;
          existingUser.name = item.name;
          existingUser.phone = item.phone;
          existingUser.isActive = true;
          existingUser.mustResetPassword = true;
          await existingUser.save({ transaction });
          createdUser = existingUser;
        } else {
          // Create new user
          createdUser = await UserModel.create(
            {
              name: item.name,
              email: item.email,
              phone: item.phone,
              passwordHash,
              role: UserRole.RESIDENT,
              isActive: true,
              mustResetPassword: true,
            },
            { transaction }
          );
        }

        // Create Resident link
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

        await transaction.commit();

        // Mark apartment as occupied in local memory set
        occupiedApartmentIds.add(apartment.id);
        successCount++;

        const unitLabel = `${apartment.block}-${apartment.floorNumber}${apartment.unitNumber}`;

        createdResidents.push({
          userId: createdUser.id!,
          email: item.email,
          name: item.name,
          unit: unitLabel,
          temporaryPassword: item.password,
          status: "pending",
        });
      } catch (err: unknown) {
        await transaction.rollback();
        const msg = err instanceof Error ? err.message : "Database error during creation";
        failedItems.push({
          row: item.rowNum,
          identifier: item.email,
          reason: `Failed to create resident: ${msg}`,
        });
      }
    }

    // 6. Send welcome credentials emails directly inside Use Case (Background dispatch)
    if (this.emailService && createdResidents.length > 0) {
      const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

      for (const item of createdResidents) {
        (async () => {
          try {
            const rawToken = crypto.randomBytes(32).toString("hex");
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

            await PasswordResetTokenModel.destroy({ where: { userId: item.userId } });
            await PasswordResetTokenModel.create({ userId: item.userId, token: rawToken, expiresAt });

            const resetLink = `${clientUrl}/reset-password?token=${rawToken}`;
            const { subject, html } = buildWelcomeEmailTemplate({
              name: item.name,
              email: item.email,
              unitName: item.unit,
              temporaryPassword: item.temporaryPassword || "",
              resetLink,
            });

            await this.emailService!.sendEmail({
              to: item.email,
              subject,
              html,
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
