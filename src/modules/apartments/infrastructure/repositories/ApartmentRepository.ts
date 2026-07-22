import { Op, literal } from "sequelize";
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
          where: { isOccupant: true, isActive: true },
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
    const isOccupied = (model as any).residents?.length > 0;
    (apartment as any).resident = (model as any).residents?.[0] ?? null;
    (apartment as any).isOccupied = isOccupied;
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
    const where: any = {};

    if (filters.search) {
      const searchTerm = filters.search.trim().replace(/[-\s]/g, '');
      where[Op.and] = [
        literal(`CONCAT(block, floor_number, unit_number) ILIKE :search`)
      ];
    }
    if (filters.type) where.type = filters.type;

    const offset = (filters.pageNumber - 1) * filters.pageSize;

    const residentInclude: any = {
      model: ResidentModel,
      as: "residents",
      where: { isOccupant: true, isActive: true },
      required: false,
      attributes: ["id"],
    };

    if (filters.isOccupied !== undefined) {
      if (filters.isOccupied) {
        residentInclude.required = true;
      } else {
        where.id = {
          [Op.notIn]: literal(
            `(SELECT apartment_id FROM residents WHERE is_occupant = true AND is_active = true AND apartment_id IS NOT NULL)`
          ),
        };
      }
    }

    const { count, rows } = await ApartmentModel.findAndCountAll({
      where,
      include: [residentInclude],
      limit: filters.pageSize,
      offset,
      order: [["block", "ASC"], ["floor_number", "ASC"], ["unit_number", "ASC"]],
      distinct: true,
      replacements: filters.search ? { search: `%${filters.search.trim().replace(/[-\s]/g, '')}%` } : undefined
    });

    return buildPaginatedResult(
      rows.map((row) => {
        const isOccupied = (row as any).residents?.length > 0;
        return {
          apartment: this.toEntity(row),
          isOccupied,
        };
      }),
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
        where: { isOccupant: true, isActive: true },
        required: true,
      }],
    });

    return {
      totalOccupied: occupied,
      totalVacant: total - occupied,
    };
  }
}