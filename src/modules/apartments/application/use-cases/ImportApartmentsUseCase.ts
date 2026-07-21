import { ApartmentType } from "../../domain/entities/Apartment";
import { ApartmentModel } from "../../infrastructure/models/ApartmentModel";
import * as XLSX from "xlsx";
import { sequelize } from "../../../../shared/config/db";

export interface FailedImportItem {
  row: number;
  identifier: string;
  reason: string;
}

export class ImportApartmentsUseCase {
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
      block: string;
      floorNumber: number;
      unitNumber: string;
      areaSqft: number;
      type: ApartmentType;
    }[] = [];

    // 1. Validation & parsing phase
    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];
      const rowNum = index + 2; // Data starts at Row 2

      const rawBlock = row["Block"];
      const rawFloor = row["Floor Number"];
      const rawUnit = row["Unit Number"];
      const rawArea = row["Area (Sqft)"];
      const rawType = row["Type"];

      const rowErrors: string[] = [];

      // Block validation
      let block = "";
      if (rawBlock === undefined || rawBlock === null || String(rawBlock).trim() === "") {
        rowErrors.push("Block is required");
      } else {
        block = String(rawBlock).trim().toUpperCase();
        if (block.length !== 1 || !/[A-Z]/.test(block)) {
          rowErrors.push("Block must be a single letter (A-Z)");
        }
      }

      // Floor Number validation
      let floorNumber = 0;
      if (rawFloor === undefined || rawFloor === null || String(rawFloor).trim() === "") {
        rowErrors.push("Floor Number is required");
      } else {
        floorNumber = Number(rawFloor);
        if (isNaN(floorNumber) || !Number.isInteger(floorNumber) || floorNumber < 1 || floorNumber > 100) {
          rowErrors.push("Floor Number must be an integer (1-100)");
        }
      }

      // Unit Number validation
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

      // Area validation
      let areaSqft = 0;
      if (rawArea === undefined || rawArea === null || String(rawArea).trim() === "") {
        rowErrors.push("Area is required");
      } else {
        areaSqft = Number(rawArea);
        if (isNaN(areaSqft) || areaSqft <= 0) {
          rowErrors.push("Area must be a positive number");
        }
      }

      // Type validation
      let type: ApartmentType = ApartmentType.STUDIO;
      if (rawType === undefined || rawType === null || String(rawType).trim() === "") {
        rowErrors.push("Type is required");
      } else {
        const typeStr = String(rawType).trim().toLowerCase();
        const validTypes = Object.values(ApartmentType);
        if (!validTypes.includes(typeStr as any)) {
          rowErrors.push(`Type must be one of: ${validTypes.join(", ")}`);
        } else {
          type = typeStr as ApartmentType;
        }
      }

      if (rowErrors.length > 0) {
        failedItems.push({
          row: rowNum,
          identifier: rawBlock && rawFloor && rawUnit ? `${rawBlock}-${rawFloor}${rawUnit}` : `Row ${rowNum}`,
          reason: rowErrors.join("; "),
        });
        continue;
      }

      validRows.push({
        rowNum,
        block,
        floorNumber,
        unitNumber,
        areaSqft,
        type,
      });
    }

    // Check for duplicates within the file itself
    const uniqueKeys = new Map<string, number>();
    const duplicateIndices = new Set<number>();
    for (const row of validRows) {
      const key = `${row.block}-${row.floorNumber}-${row.unitNumber}`;
      if (uniqueKeys.has(key)) {
        const firstSeenRow = uniqueKeys.get(key)!;
        failedItems.push({
          row: row.rowNum,
          identifier: `${row.block}-${row.floorNumber}${row.unitNumber}`,
          reason: `Duplicate of row ${firstSeenRow} in same file`,
        });
        duplicateIndices.add(row.rowNum);
      } else {
        uniqueKeys.set(key, row.rowNum);
      }
    }

    // Filter out duplicates within the Excel file
    const uniqueValidRows = validRows.filter(r => !duplicateIndices.has(r.rowNum));

    let successCount = 0;
    const transaction = await sequelize.transaction();
    try {
      for (const row of uniqueValidRows) {
        // Double check against existing entries in the database
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
