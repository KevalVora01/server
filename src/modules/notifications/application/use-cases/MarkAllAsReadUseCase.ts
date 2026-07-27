import { INotificationRepository } from "../../domain/repositories/INotificationRepository";

export class MarkAllAsReadUseCase {
  constructor(private readonly notificationRepository: INotificationRepository) {}

  async execute(userId: number): Promise<void> {
    await this.notificationRepository.markAllAsRead(userId);
  }
}