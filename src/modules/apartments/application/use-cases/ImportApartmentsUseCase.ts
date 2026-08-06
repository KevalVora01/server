import { ApartmentType } from "../../domain/entities/Apartment";
import { ApartmentModel } from "../../infrastructure/models/ApartmentModel";
import { createApartmentSchema } from "../../presentation/validators/apartmentValidators";
import * as XLSX from "xlsx";
import { sequelize } from "../../../../shared/config/db";

interface ApartmentExcelRow {
  Block?: unknown;
  "Floor Number"?: unknown;
  "Unit Number"?: unknown;
  "Area (Sqft)"?: unknown;
  Type?: unknown;
}

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
    } catch {
      throw new Error("Invalid Excel file format. Please upload a valid .xlsx or .xls file.");
    }

    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      throw new Error("Excel file is empty and contains no worksheets.");
    }

    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<ApartmentExcelRow>(worksheet);

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

    // 1. Map column names & validate with Joi
    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];
      const rowNum = index + 2; // Data starts at Row 2

      const mapped = {
        block: row["Block"],
        floorNumber: row["Floor Number"],
        unitNumber: row["Unit Number"],
        areaSqft: row["Area (Sqft)"],
        type: row["Type"],
      };

      const { error, value } = createApartmentSchema.validate(mapped, { abortEarly: false });

      if (error) {
        const rawBlock = row["Block"];
        const rawFloor = row["Floor Number"];
        const rawUnit = row["Unit Number"];
        failedItems.push({
          row: rowNum,
          identifier: rawBlock && rawFloor && rawUnit ? `${rawBlock}-${rawFloor}${rawUnit}` : `Row ${rowNum}`,
          reason: error.details.map(d => d.message).join("; "),
        });
        continue;
      }

      validRows.push({
        rowNum,
        block: value.block,
        floorNumber: value.floorNumber,
        unitNumber: value.unitNumber,
        areaSqft: value.areaSqft,
        type: value.type,
      });
    }

    // 2. Check for duplicates within the file itself
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

    const uniqueValidRows = validRows.filter(r => !duplicateIndices.has(r.rowNum));

    // 3. Insert into database
    let successCount = 0;
    const transaction = await sequelize.transaction();
    try {
      for (const row of uniqueValidRows) {
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
    } catch (err) {
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
