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
  createdResidents: CreatedResidentEmailItem[];
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
        rowErrors.push("Phone is required");
      } else {
        phone = String(rawPhone).trim();
        if (phone.length !== 10 || !/^[0-9]+$/.test(phone)) {
          rowErrors.push("Phone must be exactly 10 digits");
        }
      }

      // Auto-generate completely unique, random, secure password for resident
      const password = generateRandomPassword(11);

      // Block Validation
      let block = "";
      if (rawBlock === undefined || rawBlock === null) {
        rowErrors.push("Block is required");
      } else {
        block = String(rawBlock).trim().toUpperCase();
        if (block.length !== 1 || !/^[A-Z0-9]$/.test(block)) {
          rowErrors.push("Block must be a single character (e.g. A, B)");
        }
      }

      // Floor Number Validation
      let floorNumber = 0;
      if (rawFloor === undefined || rawFloor === null) {
        rowErrors.push("Floor Number is required");
      } else {
        const parsedFloor = Number(String(rawFloor).trim());
        if (isNaN(parsedFloor) || !Number.isInteger(parsedFloor) || parsedFloor < 1 || parsedFloor > 100) {
          rowErrors.push("Floor Number must be an integer (1-100)");
        } else {
          floorNumber = parsedFloor;
        }
      }

      // Unit Number Validation
      let unitNumber = "";
      if (rawUnit === undefined || rawUnit === null) {
        rowErrors.push("Unit Number is required");
      } else {
        let uStr = String(rawUnit).trim();
        if (uStr.endsWith(".0")) uStr = uStr.slice(0, -2);
        if (/^\d+$/.test(uStr)) {
          const uInt = parseInt(uStr, 10);
          if (uInt === 0) {
            rowErrors.push("Unit Number cannot be 0");
          } else if (uInt > 99) {
            rowErrors.push("Unit Number must be 1 or 2 digits (e.g. 01, 12)");
          } else {
            unitNumber = String(uInt).padStart(2, "0");
          }
        } else if (/^\d{1,2}$/.test(uStr)) {
          unitNumber = uStr.padStart(2, "0");
        } else {
          rowErrors.push("Unit Number must be 1 or 2 digits (e.g. 01, 12)");
        }
      }

      const identifier = rawEmail ? String(rawEmail) : (block && floorNumber && unitNumber ? `${block}-${floorNumber}${unitNumber}` : `Row ${rowNum}`);

      if (rowErrors.length > 0) {
        failedItems.push({
          row: rowNum,
          identifier,
          reason: rowErrors.join("; "),
        });
        continue;
      }

      validRows.push({
        rowNum,
        name,
        email,
        password,
        phone,
        block,
        floorNumber,
        unitNumber,
      });
    }

    // Check for duplicate emails and apartments within the Excel file itself
    const emailsInFile = new Map<string, number>();
    const unitsInFile = new Map<string, number>();
    const fileDuplicateRows = new Set<number>();

    for (const row of validRows) {
      if (emailsInFile.has(row.email)) {
        const firstSeenRow = emailsInFile.get(row.email)!;
        failedItems.push({
          row: row.rowNum,
          identifier: row.email,
          reason: `Duplicate email of row ${firstSeenRow} in same file`,
        });
        fileDuplicateRows.add(row.rowNum);
      } else {
        emailsInFile.set(row.email, row.rowNum);
      }

      const unitKey = `${row.block}-${row.floorNumber}-${row.unitNumber}`;
      if (unitsInFile.has(unitKey)) {
        const firstSeenRow = unitsInFile.get(unitKey)!;
        failedItems.push({
          row: row.rowNum,
          identifier: `${row.block}-${row.floorNumber}${row.unitNumber}`,
          reason: `Duplicate assignment of apartment in row ${firstSeenRow} in same file`,
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

    return {
      successCount,
      failedCount: failedItems.length,
      failedItems,
      createdResidents,
    };
  }
}
