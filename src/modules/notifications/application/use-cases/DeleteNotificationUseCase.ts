import { INotificationRepository } from "../../domain/repositories/INotificationRepository";

export class DeleteNotificationUseCase {
  constructor(private readonly notificationRepository: INotificationRepository) {}

  async execute(id: number, userId: number): Promise<void> {
    await this.notificationRepository.delete(id, userId);
  }
}
