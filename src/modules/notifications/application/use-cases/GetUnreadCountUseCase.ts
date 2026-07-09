import { INotificationRepository } from "../../domain/repositories/INotificationRepository";

export class GetUnreadCountUseCase {
  constructor(private readonly notificationRepository: INotificationRepository) {}

  async execute(userId: number): Promise<number> {
    return this.notificationRepository.getUnreadCount(userId);
  }
}