import { INotificationRepository } from "../../domain/repositories/INotificationRepository";
import { Notification, NotificationType } from "../../domain/entities/Notification";
import { NotificationModel } from "../models/NotificationModel";
import { PaginatedRequest, PaginatedResult, buildPaginatedResult } from "../../../../shared/types/Pagination";

export class NotificationRepository implements INotificationRepository {

  private toEntity(model: NotificationModel): Notification {
    return new Notification({
      id: model.id,
      userId: model.userId,
      type: model.type as NotificationType,
      title: model.title,
      body: model.body,
      data: model.data,
      isRead: model.isRead,
      createdAt: model.createdAt,
    });
  }

  async create(notification: Notification): Promise<Notification> {
    const created = await NotificationModel.create({
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      body: notification.body,
      data: notification.data,
      isRead: notification.isRead,
    });

    return this.toEntity(created);
  }

  async findByUserId(userId: number, pagination: PaginatedRequest): Promise<PaginatedResult<Notification>> {
    const offset = (pagination.pageNumber - 1) * pagination.pageSize;

    const { count, rows } = await NotificationModel.findAndCountAll({
      where: { userId },
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

  async getUnreadCount(userId: number): Promise<number> {
    return NotificationModel.count({
      where: { userId, isRead: false },
    });
  }

  async markAsRead(ids: number[], userId: number): Promise<void> {
    await NotificationModel.update(
      { isRead: true },
      { where: { id: ids, userId } }
    );
  }

  async markAllAsRead(userId: number): Promise<void> {
    await NotificationModel.update(
      { isRead: true },
      { where: { userId, isRead: false } }
    );
  }
}