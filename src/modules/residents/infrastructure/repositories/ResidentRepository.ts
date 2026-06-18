import { Op } from "sequelize";
import { IResidentRepository, ListResidentsFilters } from "../../domain/repositories/IResidentRepository";
import { Resident } from "../../domain/entities/Resident";
import { PaginatedResult, buildPaginatedResult } from "../../../../shared/types/Pagination";
import { ResidentModel } from "../models/ResidentModel";
import { UserModel } from "../../../auth/infrastructure/models/UserModel";

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
      where: {
        id,
        isActive: true,
      },
      include: [
        {
          model: UserModel,
          as: "user",
          attributes: ["id", "name", "email", "phone"],
        },
      ],
    });

    if (!model) return null;
    return this.toEntity(model);
  }

  async findByUserId(userId: number): Promise<Resident | null> {
    const model = await ResidentModel.findOne({
      where: { userId },
    });

    if (!model) return null;
    return this.toEntity(model);
  }

  async findAll(filters: ListResidentsFilters): Promise<PaginatedResult<Resident>> {
    const where: any = {
      isActive: filters.isActive ?? true,
    };

    if (filters.apartmentId) where.apartmentId = filters.apartmentId;
    if (filters.isOwner !== undefined) where.isOwner = filters.isOwner;

    const userWhere: any = {};
    if (filters.search) {
      userWhere[Op.or] = [
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
      ],
      limit: filters.pageSize,
      offset,
      order: [["createdAt", "DESC"]],
    });

    return buildPaginatedResult(
      rows.map(this.toEntity.bind(this)),
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
        updatedAt: resident.updatedAt,
      },
      { where: { id: resident.id } }
    );

    const updated = await ResidentModel.findByPk(resident.id);
    return this.toEntity(updated!);
  }

  async deactivate(id: number): Promise<void> {
    await ResidentModel.update(
      { isActive: false },
      { where: { id } }
    );
  }
}