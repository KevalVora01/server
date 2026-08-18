import { PaginatedRequest, PaginatedResult } from "../../../../shared/types/Pagination";
import { Notification } from "../entities/Notification";

export interface INotificationRepository {
  create(notification: Notification): Promise<Notification>;
  findByUserId(userId: number, pagination: PaginatedRequest): Promise<PaginatedResult<Notification>>;
  getUnreadCount(userId: number): Promise<number>;
  markAsRead(id: number, userId: number): Promise<void>;
  markAllAsRead(userId: number): Promise<void>;
  delete(id: number, userId: number): Promise<void>;
  deleteAll(userId: number): Promise<void>;
}