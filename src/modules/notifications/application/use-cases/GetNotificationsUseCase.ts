import { PaginatedRequest, PaginatedResult } from "../../../../shared/types/Pagination";
import { Notification } from "../../domain/entities/Notification";
import { INotificationRepository } from "../../domain/repositories/INotificationRepository";

export class GetNotificationsUseCase {
  constructor(private readonly notificationRepository: INotificationRepository) {}

  async execute(userId: number, pagination: PaginatedRequest): Promise<PaginatedResult<Notification>> {
    return this.notificationRepository.findByUserId(userId, pagination);
  }
}