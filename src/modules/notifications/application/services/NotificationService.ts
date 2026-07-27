import { getIO } from "../../../../shared/socket/socket.server";
import { Rooms } from "../../../../shared/socket/socket.rooms";
import { SOCKET_EVENTS } from "../../../../shared/socket/socket.events";
import { Notification, NotificationType } from "../../domain/entities/Notification";
import { INotificationRepository } from "../../domain/repositories/INotificationRepository";

export class NotificationService {
  constructor(private readonly notificationRepository: INotificationRepository) {}

  async notify(
    userId: number,
    type: NotificationType,
    title: string,
    body: string,
    data: Record<string, unknown> = {}
  ): Promise<Notification> {
    const notification = Notification.create({
      userId,
      type,
      title,
      body,
      data,
    });

    const saved = await this.notificationRepository.create(notification);

    getIO().to(Rooms.user(userId)).emit(SOCKET_EVENTS.NOTIFICATION_NEW, saved.toResponseObject());

    return saved;
  }
}