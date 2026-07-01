import { IApartmentRepository, ListApartmentsFilters, ApartmentWithOccupancy } from "../../domain/repositories/IApartmentRepository";
import { Apartment } from "../../domain/entities/Apartment";
import { PaginatedResult, buildPaginatedResult } from "../../../../shared/types/Pagination";
import { ApartmentModel } from "../models/ApartmentModel";
import { ResidentModel } from "../../../residents/infrastructure/models/ResidentModel";
import { UserModel } from "../../../auth/infrastructure/models/UserModel";

export class ApartmentRepository implements IApartmentRepository {

  private toEntity(model: ApartmentModel): Apartment {
    return new Apartment({
      id: model.id,
      block: model.block,
      floorNumber: model.floorNumber,
      unitNumber: model.unitNumber,
      areaSqft: model.areaSqft,
      type: model.type,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }

  async create(apartment: Apartment): Promise<Apartment> {
    const created = await ApartmentModel.create({
      block: apartment.block,
      floorNumber: apartment.floorNumber,
      unitNumber: apartment.unitNumber.padStart(2, '0'),
      areaSqft: apartment.areaSqft,
      type: apartment.type,
    });

    return this.toEntity(created);
  }

  async findById(id: number): Promise<Apartment | null> {
    const model = await ApartmentModel.findByPk(id, {
      include: [
        {
          model: ResidentModel,
          as: "residents",
          where: { isActive: true },
          required: false,
          include: [
            {
              model: UserModel,
              as: "user",
              attributes: ["id", "name", "email", "phone"],
            },
          ],
        },
      ],
    });

    if (!model) return null;

    const apartment = this.toEntity(model);
    const activeResident = (model as any).residents?.[0] ?? null;
    (apartment as any).resident = activeResident;
    (apartment as any).isOccupied = activeResident !== null;
    return apartment;
  }

  async findByBlockFloorAndUnit(block: string, floorNumber: number, unitNumber: string): Promise<Apartment | null> {
    const model = await ApartmentModel.findOne({
      where: { block, floorNumber, unitNumber },
    });
    if (!model) return null;
    return this.toEntity(model);
  }

  async findAll(filters: ListApartmentsFilters): Promise<PaginatedResult<ApartmentWithOccupancy>> {
    const where: Record<string, unknown> = {};

    if (filters.block) where.block = filters.block;
    if (filters.floorNumber) where.floorNumber = filters.floorNumber;
    if (filters.type) where.type = filters.type;

    const offset = (filters.pageNumber - 1) * filters.pageSize;

    const { count, rows } = await ApartmentModel.findAndCountAll({
      where,
      include: [
        {
          model: ResidentModel,
          as: "residents",
          where: { isActive: true },
          required: false, // LEFT JOIN
          attributes: ["id"],
        },
      ],
      limit: filters.pageSize,
      offset,
      order: [["block", "ASC"], ["floor_number", "ASC"], ["unit_number", "ASC"]],
      distinct: true, // needed for correct count with include
    });

    return buildPaginatedResult(
      rows.map((row) => ({
        apartment: this.toEntity(row),
        isOccupied: ((row as any).residents?.length ?? 0) > 0,
      })),
      count,
      filters.pageNumber,
      filters.pageSize
    );
  }

  async update(apartment: Apartment): Promise<Apartment> {
    await ApartmentModel.update(
      {
        block: apartment.block,
        floorNumber: apartment.floorNumber,
        unitNumber: apartment.unitNumber,
        areaSqft: apartment.areaSqft,
        type: apartment.type,
        updatedAt: apartment.updatedAt,
      },
      { where: { id: apartment.id } }
    );

    const updated = await ApartmentModel.findByPk(apartment.id);
    return this.toEntity(updated!);
  }

  async getStats(): Promise<{ totalOccupied: number; totalVacant: number }> {
    const total = await ApartmentModel.count();
    const occupied = await ApartmentModel.count({
      distinct: true,
      col: 'id',
      include: [{
        model: ResidentModel,
        as: "residents",
        where: { isActive: true },
        required: true,
      }],
    });

    return {
      totalOccupied: occupied,
      totalVacant: total - occupied,
    };
  }
}