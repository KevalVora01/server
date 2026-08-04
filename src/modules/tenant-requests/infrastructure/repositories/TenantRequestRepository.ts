import { ITenantRequestRepository, ListTenantRequestsFilters } from "../../domain/repositories/ITenantRequestRepository";
import { TenantRequest, TenantRequestStatus } from "../../domain/entities/TenantRequest";
import { TenantRequestModel } from "../models/TenantRequestModel";
import { UserModel } from "../../../auth/infrastructure/models/UserModel";
import { PaginatedResult, buildPaginatedResult } from "../../../../shared/types/Pagination";
import { ResidentModel } from "../../../residents/infrastructure/models/ResidentModel";
import { ApartmentModel } from "../../../apartments/infrastructure/models/ApartmentModel";

export class TenantRequestRepository implements ITenantRequestRepository {

  private toEntity(model: TenantRequestModel): TenantRequest {
    const request = new TenantRequest({
      id: model.id,
      apartmentId: model.apartmentId,
      requestedBy: model.requestedBy,
      tenantName: model.tenantName,
      tenantEmail: model.tenantEmail,
      tenantPhone: model.tenantPhone,
      moveInDate: model.moveInDate,
      status: model.status,
      createdAt: model.createdAt,
      decidedAt: model.decidedAt,
    });

    const relModel = model as TenantRequestModel & { owner?: Record<string, unknown> | null; apartment?: Record<string, unknown> | null };
    request.owner = relModel.owner ?? null;
    request.apartment = relModel.apartment ?? null;
    return request;
  }

  async create(request: TenantRequest): Promise<TenantRequest> {
    const created = await TenantRequestModel.create({
      apartmentId: request.apartmentId,
      requestedBy: request.requestedBy,
      tenantName: request.tenantName,
      tenantEmail: request.tenantEmail,
      tenantPhone: request.tenantPhone,
      moveInDate: request.moveInDate,
      status: request.status,
    });

    return this.toEntity(created);
  }

  async findById(id: number): Promise<TenantRequest | null> {
    const model = await TenantRequestModel.findOne({
      where: { id },
      include: [
        {
          model: ResidentModel,
          as: "owner",
          attributes: ["id", "userId", "apartmentId"],
          include: [{ model: UserModel, as: "user", attributes: ["id", "name", "email"] }],
        },
        {
          model: ApartmentModel,
          as: "apartment",
          attributes: ["id", "block", "floorNumber", "unitNumber"],
        },
      ],
    });

    if (!model) return null;
    return this.toEntity(model);
  }

  async findAll(filters: ListTenantRequestsFilters): Promise<PaginatedResult<TenantRequest>> {
    const where: Record<string, unknown> = {};

    if (filters.status) where.status = filters.status;
    if (filters.apartmentId) where.apartmentId = filters.apartmentId;

    const offset = (filters.pageNumber - 1) * filters.pageSize;

    const { count, rows } = await TenantRequestModel.findAndCountAll({
      where,
      include: [
        {
          model: ResidentModel,
          as: "owner",
          attributes: ["id", "userId", "apartmentId"],
          include: [{ model: UserModel, as: "user", attributes: ["id", "name", "email"] }],
        },
        {
          model: ApartmentModel,
          as: "apartment",
          attributes: ["id", "block", "floorNumber", "unitNumber"],
        },
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

  async findPendingByApartmentId(apartmentId: number): Promise<TenantRequest | null> {
    const model = await TenantRequestModel.findOne({
      where: { apartmentId, status: TenantRequestStatus.PENDING },
      include: [
        {
          model: ApartmentModel,
          as: "apartment",
          attributes: ["id", "block", "floorNumber", "unitNumber"],
        },
      ],
    });

    if (!model) return null;
    return this.toEntity(model);
  }

  async update(request: TenantRequest): Promise<TenantRequest> {
    await TenantRequestModel.update(
      {
        status: request.status,
        decidedAt: request.decidedAt,
      },
      { where: { id: request.id } }
    );

    const updated = await TenantRequestModel.findByPk(request.id);
    return this.toEntity(updated!);
  }
}