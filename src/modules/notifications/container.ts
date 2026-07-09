import { NotificationRepository } from "./infrastructure/repositories/NotificationRepository";

import { NotificationService } from "./application/services/NotificationService";
import { GetNotificationsUseCase } from "./application/use-cases/GetNotificationsUseCase";
import { GetUnreadCountUseCase } from "./application/use-cases/GetUnreadCountUseCase";
import { MarkAsReadUseCase } from "./application/use-cases/MarkAsReadUseCase";
import { MarkAllAsReadUseCase } from "./application/use-cases/MarkAllAsReadUseCase";

import { NotificationController } from "./presentation/controllers/NotificationController";

// Repository
const notificationRepository = new NotificationRepository();

// Service (exported — other modules like complaints/notices will import this)
export const notificationService = new NotificationService(notificationRepository);

// Use Cases
const getNotificationsUseCase = new GetNotificationsUseCase(notificationRepository);
const getUnreadCountUseCase = new GetUnreadCountUseCase(notificationRepository);
const markAsReadUseCase = new MarkAsReadUseCase(notificationRepository);
const markAllAsReadUseCase = new MarkAllAsReadUseCase(notificationRepository);

// Controller
export const notificationController = new NotificationController(
  getNotificationsUseCase,
  getUnreadCountUseCase,
  markAsReadUseCase,
  markAllAsReadUseCase,
);