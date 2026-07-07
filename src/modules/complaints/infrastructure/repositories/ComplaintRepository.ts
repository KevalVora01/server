import { Op } from "sequelize";
import { IComplaintRepository, ListComplaintsFilters } from "../../domain/repositories/IComplaintRepository";
import { Complaint, ComplaintPriority, ComplaintStatus } from "../../domain/entities/Complaint";
import { ComplaintImage } from "../../domain/entities/ComplaintImage";
import { ComplaintModel } from "../models/ComplaintModel";
import { ComplaintImageModel } from "../models/ComplaintImageModel";
import { PaginatedResult, PaginatedRequest, buildPaginatedResult } from "../../../../shared/types/Pagination";
import { ResidentModel } from "../../../residents/infrastructure/models/ResidentModel";

export class ComplaintRepository implements IComplaintRepository {

  private toEntity(model: ComplaintModel): Complaint {
    const complaint = new Complaint({
      id: model.id,
      residentId: model.residentId,
      title: model.title,
      description: model.description,
      priority: model.priority as ComplaintPriority,
      status: model.status as ComplaintStatus,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      resolvedAt: model.resolvedAt,
    });

    (complaint as any).resident = (model as any).resident ?? null;
    return complaint;
  }

  private toImageEntity(model: ComplaintImageModel): ComplaintImage {
    return new ComplaintImage({
      id: model.id,
      complaintId: model.complaintId,
      imageUrl: model.imageUrl,
      createdAt: model.createdAt,
    });
  }

  async create(complaint: Complaint, imageUrls?: string[]): Promise<Complaint> {
    const created = await ComplaintModel.create({
      residentId: complaint.residentId,
      title: complaint.title,
      description: complaint.description,
      priority: complaint.priority,
      status: complaint.status,
    });

    if (imageUrls && imageUrls.length > 0) {
      await ComplaintImageModel.bulkCreate(
        imageUrls.map((url) => ({
          complaintId: created.id,
          imageUrl: url,
        }))
      );
    }

    return this.toEntity(created);
  }

  async findById(id: number): Promise<Complaint | null> {
    const model = await ComplaintModel.findOne({
      where: { id },
      include: [
        {
          model: ResidentModel,
          as: "resident",
          attributes: ["id", "userId", "apartmentId"],
        },
      ],
    });

    if (!model) return null;

    return this.toEntity(model);
  }

  async findImagesByComplaintId(complaintId: number): Promise<ComplaintImage[]> {
    const models = await ComplaintImageModel.findAll({ where: { complaintId } });
    return models.map((m) => this.toImageEntity(m));
  }

  async findAll(filters: ListComplaintsFilters): Promise<PaginatedResult<Complaint>> {
    const where: Record<string, unknown> = {};

    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;
    if (filters.residentId) where.residentId = filters.residentId;
    if (filters.search) {
      where[Op.or as any] = [
        { title: { [Op.iLike]: `%${filters.search}%` } },
        { description: { [Op.iLike]: `%${filters.search}%` } },
      ];
    }

    const offset = (filters.pageNumber - 1) * filters.pageSize;

    const { count, rows } = await ComplaintModel.findAndCountAll({
      where,
      include: [
        {
          model: ResidentModel,
          as: "resident",
          attributes: ["id", "userId", "apartmentId"],
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

  async findByResidentId(residentId: number, pagination: PaginatedRequest): Promise<PaginatedResult<Complaint>> {
    const offset = (pagination.pageNumber - 1) * pagination.pageSize;

    const { count, rows } = await ComplaintModel.findAndCountAll({
      where: { residentId },
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

  async update(complaint: Complaint): Promise<Complaint> {
    await ComplaintModel.update(
      {
        status: complaint.status,
        resolvedAt: complaint.resolvedAt,
      },
      { where: { id: complaint.id } }
    );

    const updated = await ComplaintModel.findByPk(complaint.id);
    return this.toEntity(updated!);
  }
}