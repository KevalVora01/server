import { Op } from "sequelize";
import { INoticeRepository, ListNoticesFilters } from "../../domain/repositories/INoticeRepository";
import { Notice } from "../../domain/entities/Notice";
import { NoticeModel } from "../models/NoticeModel";
import { UserModel } from "../../../auth/infrastructure/models/UserModel";
import { PaginatedResult, buildPaginatedResult } from "../../../../shared/types/Pagination";
import { NoticeCategory } from "../../domain/entities/Notice";

export class NoticeRepository implements INoticeRepository {

  private toEntity(model: NoticeModel): Notice {
    return new Notice({
      id: model.id,
      adminId: model.adminId,
      title: model.title,
      body: model.body,
      category: model.category as NoticeCategory,
      isPinned: model.isPinned,
      isActive: model.isActive,
      publishedAt: model.publishedAt,
      updatedAt: model.updatedAt,
    });
  }

  async create(notice: Notice): Promise<Notice> {
    const created = await NoticeModel.create({
      adminId: notice.adminId,
      title: notice.title,
      body: notice.body,
      category: notice.category,
      isPinned: notice.isPinned,
      isActive: notice.isActive,
    });

    return this.toEntity(created);
  }

  async findById(id: number): Promise<Notice | null> {
    const model = await NoticeModel.findOne({
      where: { id },
      include: [
        {
          model: UserModel,
          as: "admin",
          attributes: ["id", "name"],
        },
      ],
    });

    if (!model) return null;

    const notice = this.toEntity(model);
    (notice as any).admin = (model as any).admin ?? null;
    return notice;
  }

  async findAll(filters: ListNoticesFilters): Promise<PaginatedResult<Notice>> {
    const where: Record<string, unknown> = {};

    if (filters.isActive !== undefined) where.isActive = filters.isActive;
    if (filters.isPinned !== undefined) where.isPinned = filters.isPinned;
    if (filters.category) where.category = filters.category;
    if (filters.search) {
      where[Op.or as any] = [
        { title: { [Op.iLike]: `%${filters.search}%` } },
        { body: { [Op.iLike]: `%${filters.search}%` } },
      ];
    }

    const offset = (filters.pageNumber - 1) * filters.pageSize;

    const { count, rows } = await NoticeModel.findAndCountAll({
      where,
      include: [
        {
          model: UserModel,
          as: "admin",
          attributes: ["id", "name"],
        },
      ],
      limit: filters.pageSize,
      offset,
      order: [
        ["isPinned", "DESC"],
        ["publishedAt", "DESC"],
      ],
    });

    return buildPaginatedResult(
      rows.map((row) => {
        const notice = this.toEntity(row);
        (notice as any).admin = (row as any).admin ?? null;
        return notice;
      }),
      count,
      filters.pageNumber,
      filters.pageSize
    );
  }

  async update(notice: Notice): Promise<Notice> {
    await NoticeModel.update(
      {
        title: notice.title,
        body: notice.body,
        category: notice.category,
        isPinned: notice.isPinned,
        isActive: notice.isActive,
      },
      { where: { id: notice.id } }
    );

    const updated = await NoticeModel.findByPk(notice.id);
    return this.toEntity(updated!);
  }

  async delete(id: number): Promise<void> {
    await NoticeModel.destroy({ where: { id } });
  }
}