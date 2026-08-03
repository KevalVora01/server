import { IResidentRepository } from "../../domain/repositories/IResidentRepository";
import { IUserRepository } from "../../../auth/domain/repositories/IUserRepository";
import { IPasswordHasher } from "../../../auth/domain/services/IPasswordHasher";
import { UserRole } from "../../../auth/domain/entities/User";
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

export class ImportResidentsUseCase {
  constructor(
    private readonly residentRepository: IResidentRepository,
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher
  ) { }

  async execute(fileBuffer: Buffer): Promise<{ successCount: number; failedCount: number; failedItems: FailedImportItem[] }> {
    let workbook;
    try {
      workbook = XLSX.read(fileBuffer, { type: "buffer" });
    } catch (err) {
      throw new Error("Invalid Excel file format. Please upload a valid .xlsx or .xls file.");
    }

    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      throw new Error("Excel file is empty and contains no worksheets.");
    }

    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<any>(worksheet);

    if (rows.length === 0) {
      throw new Error("No data rows found in the uploaded Excel sheet.");
    }

    const failedItems: FailedImportItem[] = [];
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

      const rawName = row["Name"];
      const rawEmail = row["Email"];
      const rawPassword = row["Password"];
      const rawPhone = row["Phone"];
      const rawBlock = row["Block"];
      const rawFloor = row["Floor Number"];
      const rawUnit = row["Unit Number"];

      const rowErrors: string[] = [];

      // Name Validation
      let name = "";
      if (rawName === undefined || rawName === null || String(rawName).trim() === "") {
        rowErrors.push("Name is required");
      } else {
        name = String(rawName).trim();
        if (name.length < 2 || name.length > 100) {
          rowErrors.push("Name must be between 2 and 100 characters");
        }
      }

      // Email Validation
      let email = "";
      if (rawEmail === undefined || rawEmail === null || String(rawEmail).trim() === "") {
        rowErrors.push("Email is required");
      } else {
        email = String(rawEmail).trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          rowErrors.push("Please provide a valid email");
        }
      }

      // Password Validation
      let password = "";
      if (rawPassword === undefined || rawPassword === null || String(rawPassword).trim() === "") {
        rowErrors.push("Password is required");
      } else {
        password = String(rawPassword);
        if (password.length < 8) {
          rowErrors.push("Password must be at least 8 characters");
        }
        if (!/[A-Z]/.test(password)) {
          rowErrors.push("Password must contain at least one uppercase letter");
        }
        if (!/[0-9]/.test(password)) {
          rowErrors.push("Password must contain at least one number");
        }
        if (!/[\W_]/.test(password)) {
          rowErrors.push("Password must contain at least one special character");
        }
      }

      // Phone Validation
      let phone = "";
      if (rawPhone === undefined || rawPhone === null || String(rawPhone).trim() === "") {
        rowErrors.push("Phone is required");
      } else {
        phone = String(rawPhone).trim();
        if (phone.length !== 10 || !/^[0-9]+$/.test(phone)) {
          rowErrors.push("Phone must be exactly 10 digits");
        }
      }

      // Block Validation
      let block = "";
      if (rawBlock === undefined || rawBlock === null || String(rawBlock).trim() === "") {
        rowErrors.push("Block is required");
      } else {
        block = String(rawBlock).trim().toUpperCase();
        if (block.length !== 1 || !/[A-Z]/.test(block)) {
          rowErrors.push("Block must be a single letter (A-Z)");
        }
      }

      // Floor Number Validation
      let floorNumber = 0;
      if (rawFloor === undefined || rawFloor === null || String(rawFloor).trim() === "") {
        rowErrors.push("Floor Number is required");
      } else {
        floorNumber = Number(rawFloor);
        if (isNaN(floorNumber) || !Number.isInteger(floorNumber) || floorNumber < 1 || floorNumber > 100) {
          rowErrors.push("Floor Number must be an integer (1-100)");
        }
      }

      // Unit Number Validation
      let unitNumber = "";
      if (rawUnit === undefined || rawUnit === null || String(rawUnit).trim() === "") {
        rowErrors.push("Unit Number is required");
      } else {
        unitNumber = String(rawUnit).trim();
        if (/^\d$/.test(unitNumber)) {
          unitNumber = unitNumber.padStart(2, "0");
        }
        if (!/^\d{2}$/.test(unitNumber)) {
          rowErrors.push("Unit Number must be 1 or 2 digits");
        } else if (unitNumber === "00") {
          rowErrors.push("Unit Number cannot be 00");
        }
      }

      if (rowErrors.length > 0) {
        failedItems.push({
          row: rowNum,
          identifier: rawEmail ? String(rawEmail) : `Row ${rowNum}`,
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
        // 1. Check if a user with this email already exists
        const existingUser = await this.userRepository.findByEmail(row.email);

        let createdUser: any;

        if (existingUser && existingUser.isActive) {
          // Active user — cannot import duplicate
          failedItems.push({
            row: row.rowNum,
            identifier: row.email,
            reason: `User with this email already exists and is active`,
          });
          continue;
        }

        if (existingUser && !existingUser.isActive) {
          // Dormant user — reactivate and reuse their account
          const passwordHash = await this.passwordHasher.hash(row.password);
          existingUser.updatePassword(passwordHash);
          existingUser.updateName(row.name);
          existingUser.updatePhone(row.phone);
          existingUser.reactivate();
          existingUser.requirePasswordReset();
          createdUser = await this.userRepository.update(existingUser);
        } else {
          // No existing user — create new
          const passwordHash = await this.passwordHasher.hash(row.password);
          createdUser = await UserModel.create(
            {
              name: row.name,
              email: row.email,
              phone: row.phone,
              passwordHash,
              role: UserRole.RESIDENT,
            },
            { transaction }
          );
        }

        // 2. Resolve Apartment
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

        // 3. Verify Apartment is not occupied
        const existingActiveResident = await this.residentRepository.findActiveByApartmentId(apartment.id);
        if (existingActiveResident) {
          failedItems.push({
            row: row.rowNum,
            identifier: `${row.block}-${row.floorNumber}${row.unitNumber}`,
            reason: `Apartment unit is already occupied by an active resident`,
          });
          continue;
        }

        // 4. Create Resident
        await ResidentModel.create(
          {
            userId: createdUser.id,
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
      }
      await transaction.commit();
    } catch (err: any) {
      await transaction.rollback();
      throw err;
    }

    return {
      successCount,
      failedCount: failedItems.length,
      failedItems,
    };
  }
}
