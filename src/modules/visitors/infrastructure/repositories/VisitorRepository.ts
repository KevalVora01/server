import { Op, literal } from "sequelize";
import { IVisitorRepository, ListVisitorsFilters } from "../../domain/repositories/IVisitorRepository";
import { Visitor, VisitorStatus } from "../../domain/entities/Visitor";
import { VisitorModel } from "../models/VisitorModel";
import { ResidentModel } from "../../../residents/infrastructure/models/ResidentModel";
import { ApartmentModel } from "../../../apartments/infrastructure/models/ApartmentModel";
import { UserModel } from "../../../auth/infrastructure/models/UserModel";
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
      photoUploadedAt: model.photoUploadedAt,
      createdAt: model.createdAt,
    });

    const relModel = model as VisitorModel & { apartment?: Record<string, unknown> | null; resident?: Record<string, unknown> | null };
    visitor.apartment = relModel.apartment ?? null;
    visitor.resident = relModel.resident ?? null;
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
      photoUploadedAt: visitor.photoUploadedAt ?? null,
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
    const where: Record<string | symbol, unknown> = {};

    if (filters.status) {
      where.status = filters.status;
    } else if (filters.loggedOnly) {
      where.status = { [Op.in]: [VisitorStatus.CHECKED_OUT, VisitorStatus.CANCELLED, VisitorStatus.REJECTED] };
    }
    if (filters.apartmentId) where.apartmentId = filters.apartmentId;
    if (filters.search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${filters.search}%` } },
        { phone: { [Op.iLike]: `%${filters.search}%` } },
      ];
    }

    const offset = (filters.pageNumber - 1) * filters.pageSize;

    const { count, rows } = await VisitorModel.findAndCountAll({
      where,
      include: [
        { model: ApartmentModel, as: "apartment", attributes: ["id", "block", "floorNumber", "unitNumber"] },
        {
          model: ResidentModel,
          as: "resident",
          attributes: ["id", "userId", "apartmentId"],
          include: [
            { model: UserModel, as: "user", attributes: ["id", "name"], required: false },
          ],
        },
      ],
      limit: filters.pageSize,
      offset,
      order: [
        [literal("CASE WHEN \"Visitor\".\"status\" = 'CheckedIn' THEN 0 WHEN \"Visitor\".\"status\" = 'CheckedOut' THEN 1 WHEN \"Visitor\".\"status\" = 'Approved' THEN 2 WHEN \"Visitor\".\"status\" = 'Pending' THEN 3 WHEN \"Visitor\".\"status\" = 'Rejected' THEN 4 WHEN \"Visitor\".\"status\" = 'Cancelled' THEN 5 END"), "ASC"],
        [literal("COALESCE(\"Visitor\".\"checked_out_at\", \"Visitor\".\"checked_in_at\", \"Visitor\".\"expected_at\", \"Visitor\".\"created_at\")"), "DESC"],
      ],
    });

    return buildPaginatedResult(
      rows.map((row) => this.toEntity(row)),
      count,
      filters.pageNumber,
      filters.pageSize
    );
  }

  async findByApartmentId(apartmentId: number, pagination: PaginatedRequest, filters?: { status?: VisitorStatus; search?: string; residentId?: number }): Promise<PaginatedResult<Visitor>> {
    const offset = (pagination.pageNumber - 1) * pagination.pageSize;

    const where: Record<string | symbol, unknown> = { apartmentId };
    if (filters?.residentId) where.residentId = filters.residentId;
    if (filters?.status) where.status = filters.status;
    if (filters?.search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${filters.search}%` } },
        { phone: { [Op.iLike]: `%${filters.search}%` } },
      ];
    }

    const { count, rows } = await VisitorModel.findAndCountAll({
      where,
      include: [
        { model: ApartmentModel, as: "apartment", attributes: ["id", "block", "floorNumber", "unitNumber"] },
        { model: ResidentModel, as: "resident", attributes: ["id", "userId", "apartmentId"] },
      ],
      limit: pagination.pageSize,
      offset,
      order: [
        [literal("CASE WHEN \"Visitor\".\"status\" = 'CheckedIn' THEN 0 WHEN \"Visitor\".\"status\" = 'CheckedOut' THEN 1 WHEN \"Visitor\".\"status\" = 'Approved' THEN 2 WHEN \"Visitor\".\"status\" = 'Pending' THEN 3 WHEN \"Visitor\".\"status\" = 'Rejected' THEN 4 WHEN \"Visitor\".\"status\" = 'Cancelled' THEN 5 END"), "ASC"],
        [literal("COALESCE(\"Visitor\".\"checked_out_at\", \"Visitor\".\"checked_in_at\", \"Visitor\".\"expected_at\", \"Visitor\".\"created_at\")"), "DESC"],
      ],
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

  async findAllExpiredExpectedVisits(): Promise<Visitor[]> {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const models = await VisitorModel.findAll({
      where: {
        status: { [Op.in]: [VisitorStatus.APPROVED, VisitorStatus.PENDING] },
        expectedAt: {
          [Op.ne]: null,
          [Op.lt]: startOfToday,
        },
      },
    });

    return models.map((m) => this.toEntity(m));
  }

  async findAllWithExpiredPhotos(cutoff: Date): Promise<Visitor[]> {
    const models = await VisitorModel.findAll({
      where: {
        photoUrl: { [Op.ne]: null },
        photoUploadedAt: { [Op.lt]: cutoff },
      },
    });

    return models.map((m) => this.toEntity(m));
  }

  async findAllPreRegisteredApproved(): Promise<Visitor[]> {
    const models = await VisitorModel.findAll({
      where: {
        isPreRegistered: true,
        status: VisitorStatus.APPROVED,
      },
      include: [
        { model: ApartmentModel, as: "apartment", attributes: ["id", "block", "floorNumber", "unitNumber"] },
        { model: ResidentModel, as: "resident", attributes: ["id", "userId", "apartmentId"] },
      ],
      order: [["expectedAt", "ASC"]],
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
        photoUrl: visitor.photoUrl ?? null,
        photoUploadedAt: visitor.photoUploadedAt ?? null,
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

  async cancelByResidentId(residentId: number): Promise<void> {
    await VisitorModel.update(
      { status: VisitorStatus.CANCELLED },
      {
        where: {
          residentId,
          status: { [Op.in]: [VisitorStatus.PENDING, VisitorStatus.APPROVED] },
          isPreRegistered: true,
        },
      }
    );
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
        checkedInAt: { [Op.ne]: null as unknown as Date },
        checkedOutAt: { [Op.ne]: null as unknown as Date },
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