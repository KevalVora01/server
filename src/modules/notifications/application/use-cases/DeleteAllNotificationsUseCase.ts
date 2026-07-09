import { INotificationRepository } from "../../domain/repositories/INotificationRepository";

export class DeleteAllNotificationsUseCase {
  constructor(private readonly notificationRepository: INotificationRepository) {}

  async execute(userId: number): Promise<void> {
    await this.notificationRepository.deleteAll(userId);
  }
}
