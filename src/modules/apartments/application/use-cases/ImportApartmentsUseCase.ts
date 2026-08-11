import { ApartmentType } from "../../domain/entities/Apartment";
import { ApartmentModel } from "../../infrastructure/models/ApartmentModel";
import * as XLSX from "xlsx";
import { sequelize } from "../../../../shared/config/sequelize";

export interface FailedImportItem {
  row: number;
  identifier: string;
  reason: string;
}

export interface ImportApartmentsResult {
  successCount: number;
  failedCount: number;
  failedItems: FailedImportItem[];
}

export class ImportApartmentsUseCase {
  async execute(fileBuffer: Buffer): Promise<ImportApartmentsResult> {
    // 0. Bulk import is allowed ONLY during initial setup when NO apartments exist in DB
    const existingCount = await ApartmentModel.count();
    if (existingCount > 0) {
      throw new Error("Bulk import is only allowed when no apartments exist in the database.");
    }

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

    // Pre-fetch all existing apartment block-floor-unit keys in database
    const existingApartments = await ApartmentModel.findAll({
      attributes: ["block", "floorNumber", "unitNumber"],
    });

    const existingDbKeys = new Set<string>();
    for (const apt of existingApartments) {
      existingDbKeys.add(`${apt.block.toUpperCase()}-${apt.floorNumber}-${apt.unitNumber.padStart(2, "0")}`);
    }

    const seenFileKeys = new Map<string, number>(); // key -> rowNum
    const validRowsToInsert: {
      rowNum: number;
      block: string;
      floorNumber: number;
      unitNumber: string;
      areaSqft: number;
      type: ApartmentType;
      key: string;
    }[] = [];

    const validTypes = Object.values(ApartmentType);

    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];
      const rowNum = index + 2; // Data starts at Row 2

      const rawBlock = getCellValue(row, ["Block", "block", "Block Name"]);
      const rawFloor = getCellValue(row, ["Floor Number", "Floor", "floorNumber", "floor"]);
      const rawUnit = getCellValue(row, ["Unit Number", "Unit", "unitNumber", "Flat Number", "unit"]);
      const rawArea = getCellValue(row, ["Area (Sqft)", "Area", "areaSqft", "area_sqft", "sqft"]);
      const rawType = getCellValue(row, ["Type (BHK)", "Type BHK", "Type", "Apartment Type", "type", "BHK"]);

      // Skip completely blank or unpopulated pre-formatted rows
      const hasBlock = rawBlock !== undefined && rawBlock !== null && String(rawBlock).trim() !== "";
      const hasFloor = rawFloor !== undefined && rawFloor !== null && String(rawFloor).trim() !== "" && Number(rawFloor) !== 0;
      const hasUnit = rawUnit !== undefined && rawUnit !== null && String(rawUnit).trim() !== "" && Number(rawUnit) !== 0;
      const hasArea = rawArea !== undefined && rawArea !== null && String(rawArea).trim() !== "" && Number(rawArea) !== 0;
      const hasType = rawType !== undefined && rawType !== null && String(rawType).trim() !== "";

      if (!hasBlock && !hasFloor && !hasUnit && !hasArea && !hasType) {
        continue;
      }

      const errors: string[] = [];

      // 1. Validate Block
      let block = "";
      if (rawBlock === undefined || rawBlock === null) {
        errors.push("Block is required");
      } else {
        block = String(rawBlock).trim().toUpperCase();
        if (block.length !== 1 || !/^[A-Z0-9]$/.test(block)) {
          errors.push("Block must be a single character (e.g. A, B)");
        }
      }

      // 2. Validate Floor Number
      let floorNumber = 0;
      if (rawFloor === undefined || rawFloor === null) {
        errors.push("Floor number is required");
      } else {
        const parsedFloor = Number(String(rawFloor).trim());
        if (isNaN(parsedFloor) || !Number.isInteger(parsedFloor) || parsedFloor < 1 || parsedFloor > 100) {
          errors.push("Floor number must be a valid integer between 1 and 100");
        } else {
          floorNumber = parsedFloor;
        }
      }

      // 3. Validate Unit Number
      let unitNumber = "";
      if (rawUnit === undefined || rawUnit === null) {
        errors.push("Unit number is required");
      } else {
        let uStr = String(rawUnit).trim();
        if (uStr.endsWith(".0")) uStr = uStr.slice(0, -2);
        if (/^\d+$/.test(uStr)) {
          const uInt = parseInt(uStr, 10);
          if (uInt === 0) {
            errors.push("Unit number cannot be 0");
          } else if (uInt > 99) {
            errors.push("Unit number must be 1 or 2 digits (e.g. 01, 12)");
          } else {
            unitNumber = String(uInt).padStart(2, "0");
          }
        } else if (/^\d{1,2}$/.test(uStr)) {
          unitNumber = uStr.padStart(2, "0");
        } else {
          errors.push("Unit number must be 1 or 2 digits (e.g. 01, 12)");
        }
      }

      // 4. Validate Area
      let areaSqft = 0;
      if (rawArea === undefined || rawArea === null) {
        errors.push("Area (Sqft) is required");
      } else {
        const parsedArea = Number(String(rawArea).trim());
        if (isNaN(parsedArea) || parsedArea <= 0) {
          errors.push("Area must be a positive number");
        } else {
          areaSqft = parsedArea;
        }
      }

      // 5. Validate & Normalize Type
      let type: ApartmentType | null = null;
      if (rawType === undefined || rawType === null) {
        errors.push("Type (BHK) is required");
      } else {
        const cleanType = String(rawType).trim().toLowerCase().replace(/[^a-z0-9]/g, "");
        if (cleanType.includes("1bhk") || cleanType === "1") type = ApartmentType.ONE_BHK;
        else if (cleanType.includes("2bhk") || cleanType === "2") type = ApartmentType.TWO_BHK;
        else if (cleanType.includes("3bhk") || cleanType === "3") type = ApartmentType.THREE_BHK;
        else if (cleanType.includes("4bhk") || cleanType === "4") type = ApartmentType.FOUR_BHK;
        else {
          const directMatch = validTypes.find((t) => t.toLowerCase() === cleanType);
          if (directMatch) type = directMatch;
        }

        if (!type) {
          errors.push(`Type (BHK) must be 1, 2, 3, or 4`);
        }
      }

      const identifier = block && floorNumber && unitNumber ? `${block}-${floorNumber}${unitNumber}` : `Row ${rowNum}`;

      if (errors.length > 0) {
        failedItems.push({
          row: rowNum,
          identifier,
          reason: errors.join("; "),
        });
        continue;
      }

      // Build Unique Key
      const key = `${block}-${floorNumber}-${unitNumber}`;

      // Check Database Existence (Apartment created only once when no apartment exists)
      if (existingDbKeys.has(key)) {
        failedItems.push({
          row: rowNum,
          identifier,
          reason: "Apartment unit already exists in database",
        });
        continue;
      }

      // Check Excel In-File Duplicate
      if (seenFileKeys.has(key)) {
        const firstRow = seenFileKeys.get(key)!;
        failedItems.push({
          row: rowNum,
          identifier,
          reason: `Duplicate unit entry of row ${firstRow} in Excel sheet`,
        });
        continue;
      }

      seenFileKeys.set(key, rowNum);
      validRowsToInsert.push({
        rowNum,
        block,
        floorNumber,
        unitNumber,
        areaSqft,
        type: type!,
        key,
      });
    }

    // Insert valid unique rows inside a database transaction
    let successCount = 0;
    if (validRowsToInsert.length > 0) {
      const transaction = await sequelize.transaction();
      try {
        for (const row of validRowsToInsert) {
          const existing = await ApartmentModel.findOne({
            where: {
              block: row.block,
              floorNumber: row.floorNumber,
              unitNumber: row.unitNumber,
            },
            transaction,
          });

          if (existing) {
            failedItems.push({
              row: row.rowNum,
              identifier: `${row.block}-${row.floorNumber}${row.unitNumber}`,
              reason: "Apartment unit already exists in database",
            });
            continue;
          }

          await ApartmentModel.create(
            {
              block: row.block,
              floorNumber: row.floorNumber,
              unitNumber: row.unitNumber,
              areaSqft: row.areaSqft,
              type: row.type,
            },
            { transaction }
          );

          existingDbKeys.add(row.key);
          successCount++;
        }

        await transaction.commit();
      } catch (err) {
        await transaction.rollback();
        throw err;
      }
    }

    return {
      successCount,
      failedCount: failedItems.length,
      failedItems,
    };
  }
}
