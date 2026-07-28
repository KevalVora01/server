import { Op } from "sequelize";
import { IVisitorRepository, ListVisitorsFilters } from "../../domain/repositories/IVisitorRepository";
import { Visitor, VisitorStatus } from "../../domain/entities/Visitor";
import { VisitorModel } from "../models/VisitorModel";
import { ResidentModel } from "../../../residents/infrastructure/models/ResidentModel";
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

    (visitor as any).resident = (model as any).resident ?? null;
    return visitor;
  }

  async create(visitor: Visitor): Promise<Visitor> {
    const created = await VisitorModel.create({
      apartmentId: visitor.apartmentId,
      residentId: visitor.residentId,
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
      include: [{ model: ResidentModel, as: "resident", attributes: ["id", "userId", "apartmentId"] }],
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
      include: [{ model: ResidentModel, as: "resident", attributes: ["id", "userId", "apartmentId"] }],
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
      include: [{ model: ResidentModel, as: "resident", attributes: ["id", "userId", "apartmentId"] }],
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
        checkedInAt: visitor.checkedInAt,
        checkedOutAt: visitor.checkedOutAt,
        loggedBySecurityId: visitor.loggedBySecurityId,
      },
      { where: { id: visitor.id } }
    );

    const updated = await VisitorModel.findByPk(visitor.id);
    return this.toEntity(updated!);
  }

  async delete(id: number): Promise<void> {
    await VisitorModel.destroy({ where: { id } });
  }

  async getDashboardMetrics(): Promise<VisitorDashboardMetrics> {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [visitorsToday, currentlyInside, completedVisits] = await Promise.all([
      VisitorModel.count({ where: { createdAt: { [Op.gte]: startOfToday } } }),
      VisitorModel.count({ where: { status: VisitorStatus.CHECKED_IN } }),
      VisitorModel.findAll({
        where: {
          status: VisitorStatus.CHECKED_OUT,
          checkedInAt: { [Op.ne]: null as any },
          checkedOutAt: { [Op.ne]: null as any },
        },
        attributes: ["checkedInAt", "checkedOutAt"],
      }),
    ]);

    let averageVisitDurationMinutes = 0;
    if (completedVisits.length > 0) {
      const totalMinutes = completedVisits.reduce((sum, v) => {
        const durationMs = v.checkedOutAt!.getTime() - v.checkedInAt!.getTime();
        return sum + durationMs / 60000;
      }, 0);
      averageVisitDurationMinutes = Math.round(totalMinutes / completedVisits.length);
    }

    return { visitorsToday, currentlyInside, averageVisitDurationMinutes };
  }
}