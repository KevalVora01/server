import { Op } from "sequelize";
import { IResidentRepository, ListResidentsFilters, ResidentStats } from "../../domain/repositories/IResidentRepository";
import { Resident } from "../../domain/entities/Resident";
import { PaginatedResult, buildPaginatedResult } from "../../../../shared/types/Pagination";
import { ResidentModel } from "../models/ResidentModel";
import { UserModel } from "../../../auth/infrastructure/models/UserModel";
import { ApartmentModel } from "../../../apartments/infrastructure/models/ApartmentModel";

export class ResidentRepository implements IResidentRepository {

  private toEntity(model: ResidentModel): Resident {
    return new Resident({
      id: model.id,
      userId: model.userId,
      apartmentId: model.apartmentId,
      isOwner: model.isOwner,
      moveInDate: model.moveInDate,
      moveOutDate: model.moveOutDate,
      isActive: model.isActive,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }

  async create(resident: Resident): Promise<Resident> {
    const created = await ResidentModel.create({
      userId: resident.userId,
      apartmentId: resident.apartmentId,
      isOwner: resident.isOwner,
      moveInDate: resident.moveInDate,
      moveOutDate: resident.moveOutDate,
      isActive: resident.isActive,
    });

    return this.toEntity(created);
  }

  async findById(id: number): Promise<Resident | null> {
    const model = await ResidentModel.findOne({
      where: { id },
      include: [
        {
          model: UserModel,
          as: "user",
          attributes: ["id", "name", "email", "phone"],
        },
        {
          model: ApartmentModel,
          as: "apartment",
          attributes: ["id", "block", "floorNumber", "flateNumber", "type"],
        },
      ],
    });

    if (!model) return null;

    const resident = this.toEntity(model);
    (resident as any).user = (model as any).user ?? null;
    (resident as any).apartment = (model as any).apartment ?? null;
    return resident;
  }

  async findByUserId(userId: number): Promise<Resident | null> {
    const model = await ResidentModel.findOne({
      where: { userId },
    });

    if (!model) return null;
    return this.toEntity(model);
  }

  async findAll(filters: ListResidentsFilters): Promise<PaginatedResult<Resident>> {

    const where: Record<string, unknown> = {};

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.apartmentId) where.apartmentId = filters.apartmentId;
    if (filters.isOwner !== undefined) where.isOwner = filters.isOwner;

    const userWhere: Record<string, unknown> = {};
    if (filters.search) {
      (userWhere as any)[Op.or] = [
        { name: { [Op.iLike]: `%${filters.search}%` } },
        { email: { [Op.iLike]: `%${filters.search}%` } },
      ];
    }

    const offset = (filters.pageNumber - 1) * filters.pageSize;

    const { count, rows } = await ResidentModel.findAndCountAll({
      where,
      include: [
        {
          model: UserModel,
          as: "user",
          attributes: ["id", "name", "email", "phone"],
          where: Object.keys(userWhere).length > 0 ? userWhere : undefined,
        },
        {
          model: ApartmentModel,
          as: "apartment",
          attributes: ["id", "block", "floorNumber", "flateNumber", "type"],
        },
      ],
      limit: filters.pageSize,
      offset,
      order: [["createdAt", "DESC"]],
    });

    return buildPaginatedResult(
      rows.map((row) => {
        const resident = this.toEntity(row);
        (resident as any).user = (row as any).user ?? null;
        (resident as any).apartment = (row as any).apartment ?? null;
        return resident;
      }),
      count,
      filters.pageNumber,
      filters.pageSize
    );
  }

  async update(resident: Resident): Promise<Resident> {
    await ResidentModel.update(
      {
        apartmentId: resident.apartmentId,
        isOwner: resident.isOwner,
        moveOutDate: resident.moveOutDate,
        isActive: resident.isActive,
        updatedAt: resident.updatedAt,
      },
      { where: { id: resident.id } }
    );
    const updated = await ResidentModel.findByPk(resident.id);
    return this.toEntity(updated!);
  }

  async deactivate(id: number): Promise<void> {
    await ResidentModel.update(
      { isActive: false, moveOutDate: new Date() },
      { where: { id } }
    );
  }

  async findActiveByApartmentId(apartmentId: number): Promise<Resident | null> {
    const model = await ResidentModel.findOne({
      where: { apartmentId, isActive: true },
    });
    if (!model) return null;
    return this.toEntity(model);
  }

  async getStats(): Promise<ResidentStats> {
    const [totalActive, totalOwners, totalTenants] = await Promise.all([
      ResidentModel.count({ where: { isActive: true } }),
      ResidentModel.count({ where: { isOwner: true, isActive: true } }),
      ResidentModel.count({ where: { isOwner: false, isActive: true } }),
    ]);
  
    return { totalActive, totalOwners, totalTenants };
  }
}

