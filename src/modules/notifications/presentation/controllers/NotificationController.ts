import type { Request, Response, NextFunction } from "express";
import { GetNotificationsUseCase } from "../../application/use-cases/GetNotificationsUseCase";
import { GetUnreadCountUseCase } from "../../application/use-cases/GetUnreadCountUseCase";
import { MarkAsReadUseCase } from "../../application/use-cases/MarkAsReadUseCase";
import { MarkAllAsReadUseCase } from "../../application/use-cases/MarkAllAsReadUseCase";
import { DeleteNotificationUseCase } from "../../application/use-cases/DeleteNotificationUseCase";
import { DeleteAllNotificationsUseCase } from "../../application/use-cases/DeleteAllNotificationsUseCase";
import { ApiResponse } from "../../../../shared/utils/apiResponse";
import { AuthenticatedRequest } from "../../../../shared/types/AuthenticatedRequest";

export class NotificationController {
  constructor(
    private readonly getNotificationsUseCase: GetNotificationsUseCase,
    private readonly getUnreadCountUseCase: GetUnreadCountUseCase,
    private readonly markAsReadUseCase: MarkAsReadUseCase,
    private readonly markAllAsReadUseCase: MarkAllAsReadUseCase,
    private readonly deleteNotificationUseCase: DeleteNotificationUseCase,
    private readonly deleteAllNotificationsUseCase: DeleteAllNotificationsUseCase,
  ) {}

  getNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;

      const result = await this.getNotificationsUseCase.execute(authReq.user.userId, {
        pageNumber: Number(req.query.pageNumber) || 1,
        pageSize: Number(req.query.pageSize) || 10,
      });

      res.status(200).json(
        ApiResponse.success({
          message: "Notifications fetched successfully",
          data: {
            ...result,
            items: result.items.map((n) => n.toResponseObject()),
          },
        })
      );
    } catch (error) {
      next(error);
    }
  };

  getUnreadCount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const count = await this.getUnreadCountUseCase.execute(authReq.user.userId);

      res.status(200).json(
        ApiResponse.success({
          message: "Unread count fetched successfully",
          data: { count },
        })
      );
    } catch (error) {
      next(error);
    }
  };

  markAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      await this.markAsReadUseCase.execute(req.body.id, authReq.user.userId);

      res.status(200).json(
        ApiResponse.success({
          message: "Notifications marked as read",
          data: null,
        })
      );
    } catch (error) {
      next(error);
    }
  };

  markAllAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      await this.markAllAsReadUseCase.execute(authReq.user.userId);

      res.status(200).json(
        ApiResponse.success({
          message: "All notifications marked as read",
          data: null,
        })
      );
    } catch (error) {
      next(error);
    }
  };

  deleteNotification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      await this.deleteNotificationUseCase.execute(Number(req.params.id), authReq.user.userId);

      res.status(200).json(
        ApiResponse.success({
          message: "Notification deleted",
          data: null,
        })
      );
    } catch (error) {
      next(error);
    }
  };

  deleteAllNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      await this.deleteAllNotificationsUseCase.execute(authReq.user.userId);

      res.status(200).json(
        ApiResponse.success({
          message: "All notifications deleted",
          data: null,
        })
      );
    } catch (error) {
      next(error);
    }
  };
}