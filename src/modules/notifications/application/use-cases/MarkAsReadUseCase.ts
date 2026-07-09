import { INotificationRepository } from "../../domain/repositories/INotificationRepository";

export class MarkAsReadUseCase {
  constructor(private readonly notificationRepository: INotificationRepository) {}

  async execute(ids: number[], userId: number): Promise<void> {
    if (!ids || ids.length === 0) {
      throw new Error("At least one notification id is required");
    }

    await this.notificationRepository.markAsRead(ids, userId);
  }
}