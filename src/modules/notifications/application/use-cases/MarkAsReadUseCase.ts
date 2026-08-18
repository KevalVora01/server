import { INotificationRepository } from "../../domain/repositories/INotificationRepository";

export class MarkAsReadUseCase {
  constructor(private readonly notificationRepository: INotificationRepository) {}

  async execute(id: number, userId: number): Promise<void> {
    await this.notificationRepository.markAsRead(id, userId);
  }
}