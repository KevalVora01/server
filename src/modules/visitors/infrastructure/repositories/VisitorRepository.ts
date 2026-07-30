import { Op } from "sequelize";
import { IVisitorRepository, ListVisitorsFilters } from "../../domain/repositories/IVisitorRepository";
import { Visitor, VisitorStatus } from "../../domain/entities/Visitor";
import { VisitorModel } from "../models/VisitorModel";
import { ResidentModel } from "../../../residents/infrastructure/models/ResidentModel";
import { ApartmentModel } from "../../../apartments/infrastructure/models/ApartmentModel";
import { PaginatedRequest, PaginatedResult, buildPaginatedResult } from "../../../../shared/types/Pagination";
import { VisitorDashboardMetrics } from "../../application/use-cases/GetDashboardMetricsUseCase";

export class VisitorRepository implements IVisitorRepository {

  private toEntity(model: VisitorModel): Visitor {
    const visitor = new Visitor({
      id: model.id,
      apartmentId: model.apartmentId,
      residentId: model.residentId,
      name: model.name,
      phone: model.phone,
      purpose: model.purpose,
      photoUrl: model.photoUrl,
      vehicleNumber: model.vehicleNumber,
      isPreRegistered: model.isPreRegistered,
      expectedAt: model.expectedAt,
      status: model.status,
      approvalRequestedAt: model.approvalRequestedAt,
      checkedInAt: model.checkedInAt,
      checkedOutAt: model.checkedOutAt,
      loggedBySecurityId: model.loggedBySecurityId,
      createdAt: model.createdAt,
    });

    (visitor as any).apartment = (model as any).apartment ?? null;
    (visitor as any).resident = (model as any).resident ?? null;
    return visitor;
  }

  async create(visitor: Visitor): Promise<Visitor> {
    const created = await VisitorModel.create({
      apartmentId: visitor.apartmentId,
      residentId: visitor.residentId ?? null,
      name: visitor.name,
      phone: visitor.phone,
      purpose: visitor.purpose,
      photoUrl: visitor.photoUrl ?? null,
      vehicleNumber: visitor.vehicleNumber ?? null,
      isPreRegistered: visitor.isPreRegistered,
      expectedAt: visitor.expectedAt ?? null,
      status: visitor.status,
      approvalRequestedAt: visitor.approvalRequestedAt ?? null,
    });

    return this.toEntity(created);
  }

  async findById(id: number): Promise<Visitor | null> {
    const model = await VisitorModel.findOne({
      where: { id },
      include: [
        { model: ApartmentModel, as: "apartment", attributes: ["id", "block", "floorNumber", "unitNumber"] },
        { model: ResidentModel, as: "resident", attributes: ["id", "userId", "apartmentId"] },
      ],
    });

    if (!model) return null;
    return this.toEntity(model);
  }

  async findByNameOrPhone(query: string): Promise<Visitor[]> {
    const models = await VisitorModel.findAll({
      where: {
        isPreRegistered: true,
        status: VisitorStatus.APPROVED,
        [Op.or]: [
          { name: { [Op.iLike]: `%${query}%` } },
          { phone: { [Op.iLike]: `%${query}%` } },
        ],
      },
      include: [
        { model: ApartmentModel, as: "apartment", attributes: ["id", "block", "floorNumber", "unitNumber"] },
        { model: ResidentModel, as: "resident", attributes: ["id", "userId", "apartmentId"] },
      ],
      order: [["expectedAt", "ASC"]],
      limit: 10,
    });

    return models.map((m) => this.toEntity(m));
  }

  async findAll(filters: ListVisitorsFilters): Promise<PaginatedResult<Visitor>> {
    const where: Record<string, unknown> = {};

    if (filters.status) where.status = filters.status;
    if (filters.apartmentId) where.apartmentId = filters.apartmentId;
    if (filters.search) {
      where[Op.or as any] = [
        { name: { [Op.iLike]: `%${filters.search}%` } },
        { phone: { [Op.iLike]: `%${filters.search}%` } },
      ];
    }

    const offset = (filters.pageNumber - 1) * filters.pageSize;

    const { count, rows } = await VisitorModel.findAndCountAll({
      where,
      include: [
        { model: ApartmentModel, as: "apartment", attributes: ["id", "block", "floorNumber", "unitNumber"] },
        { model: ResidentModel, as: "resident", attributes: ["id", "userId", "apartmentId"] },
      ],
      limit: filters.pageSize,
      offset,
      order: [["createdAt", "DESC"]],
    });

    return buildPaginatedResult(
      rows.map((row) => this.toEntity(row)),
      count,
      filters.pageNumber,
      filters.pageSize
    );
  }

  async findByApartmentId(apartmentId: number, pagination: PaginatedRequest): Promise<PaginatedResult<Visitor>> {
    const offset = (pagination.pageNumber - 1) * pagination.pageSize;

    const { count, rows } = await VisitorModel.findAndCountAll({
      where: { apartmentId },
      include: [
        { model: ApartmentModel, as: "apartment", attributes: ["id", "block", "floorNumber", "unitNumber"] },
        { model: ResidentModel, as: "resident", attributes: ["id", "userId", "apartmentId"] },
      ],
      limit: pagination.pageSize,
      offset,
      order: [["createdAt", "DESC"]],
    });

    return buildPaginatedResult(
      rows.map((row) => this.toEntity(row)),
      count,
      pagination.pageNumber,
      pagination.pageSize
    );
  }

  async findCurrentlyInside(): Promise<Visitor[]> {
    const models = await VisitorModel.findAll({
      where: { status: VisitorStatus.CHECKED_IN },
      include: [
        { model: ApartmentModel, as: "apartment", attributes: ["id", "block", "floorNumber", "unitNumber"] },
        { model: ResidentModel, as: "resident", attributes: ["id", "userId", "apartmentId"] },
      ],
      order: [["checkedInAt", "ASC"]],
    });

    return models.map((m) => this.toEntity(m));
  }

  async findAllExpiredPending(cutoff: Date): Promise<Visitor[]> {
    const models = await VisitorModel.findAll({
      where: {
        status: VisitorStatus.PENDING,
        approvalRequestedAt: { [Op.lt]: cutoff },
      },
    });

    return models.map((m) => this.toEntity(m));
  }

  async update(visitor: Visitor): Promise<Visitor> {
    await VisitorModel.update(
      {
        status: visitor.status,
        approvalRequestedAt: visitor.approvalRequestedAt ?? null,
        checkedInAt: visitor.checkedInAt ?? null,
        checkedOutAt: visitor.checkedOutAt ?? null,
        loggedBySecurityId: visitor.loggedBySecurityId ?? null,
      },
      { where: { id: visitor.id } }
    );

    const updated = await this.findById(visitor.id!);
    if (!updated) {
      throw new Error(`Failed to retrieve updated visitor ${visitor.id}`);
    }
    return updated;
  }

  async delete(id: number): Promise<void> {
    await VisitorModel.destroy({ where: { id } });
  }

  async getDashboardMetrics(): Promise<VisitorDashboardMetrics> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const visitorsToday = await VisitorModel.count({
      where: {
        createdAt: { [Op.gte]: today },
      },
    });

    const currentlyInside = await VisitorModel.count({
      where: { status: VisitorStatus.CHECKED_IN },
    });

    const checkedOutVisitors = await VisitorModel.findAll({
      where: {
        status: VisitorStatus.CHECKED_OUT,
        checkedInAt: { [Op.ne]: null as any },
        checkedOutAt: { [Op.ne]: null as any },
      },
      attributes: ["checkedInAt", "checkedOutAt"],
    });

    let totalDurationMinutes = 0;
    for (const v of checkedOutVisitors) {
      if (v.checkedInAt && v.checkedOutAt) {
        const diffMs = new Date(v.checkedOutAt).getTime() - new Date(v.checkedInAt).getTime();
        totalDurationMinutes += diffMs / (1000 * 60);
      }
    }

    const averageVisitDurationMinutes =
      checkedOutVisitors.length > 0
        ? Math.round(totalDurationMinutes / checkedOutVisitors.length)
        : 0;

    return {
      visitorsToday,
      currentlyInside,
      averageVisitDurationMinutes,
    };
  }
}