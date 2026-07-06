import type { Request, Response, NextFunction } from "express";
import { CreateNoticeUseCase } from "../../application/use-cases/CreateNoticeUseCase";
import { GetNoticeUseCase } from "../../application/use-cases/GetNoticeUseCase";
import { ListNoticesUseCase } from "../../application/use-cases/ListNoticesUseCase";
import { UpdateNoticeUseCase } from "../../application/use-cases/UpdateNoticeUseCase";
import { DeleteNoticeUseCase } from "../../application/use-cases/DeleteNoticeUseCase";
import { TogglePinNoticeUseCase } from "../../application/use-cases/TogglePinNoticeUseCase";
import { ApiResponse } from "../../../../shared/utils/apiResponse";
import { AuthenticatedRequest } from "../../../../shared/types/AuthenticatedRequest";

export class NoticeController {
  constructor(
    private readonly createNoticeUseCase: CreateNoticeUseCase,
    private readonly getNoticeUseCase: GetNoticeUseCase,
    private readonly listNoticesUseCase: ListNoticesUseCase,
    private readonly updateNoticeUseCase: UpdateNoticeUseCase,
    private readonly deleteNoticeUseCase: DeleteNoticeUseCase,
    private readonly togglePinNoticeUseCase: TogglePinNoticeUseCase,
  ) {}

  createNotice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;

      const notice = await this.createNoticeUseCase.execute({
        adminId: authReq.user.userId,
        ...req.body,
      });

      res.status(201).json(
        ApiResponse.success({
          message: "Notice created successfully",
          data: notice.toResponseObject(),
        })
      );
    } catch (error) {
      next(error);
    }
  };

  getNotice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const notice = await this.getNoticeUseCase.execute(Number(req.params.id));

      res.status(200).json(
        ApiResponse.success({
          message: "Notice fetched successfully",
          data: {
            ...notice.toResponseObject(),
            admin: (notice as any).admin ?? null,
          },
        })
      );
    } catch (error) {
      next(error);
    }
  };

  listNotices = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.listNoticesUseCase.execute({
        pageNumber: Number(req.query.pageNumber) || 1,
        pageSize: Number(req.query.pageSize) || 10,
        category: req.query.category as string | undefined,
        isPinned: req.query.isPinned !== undefined ? req.query.isPinned === "true" : undefined,
        isActive: req.query.isActive !== undefined ? req.query.isActive === "true" : undefined,
        search: req.query.search as string | undefined,
      });

      res.status(200).json(
        ApiResponse.success({
          message: "Notices fetched successfully",
          data: {
            ...result,
            items: result.items.map((n) => ({
              ...n.toResponseObject(),
              admin: (n as any).admin ?? null,
            })),
          },
        })
      );
    } catch (error) {
      next(error);
    }
  };

  updateNotice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const notice = await this.updateNoticeUseCase.execute(Number(req.params.id), req.body);

      res.status(200).json(
        ApiResponse.success({
          message: "Notice updated successfully",
          data: notice.toResponseObject(),
        })
      );
    } catch (error) {
      next(error);
    }
  };

  deleteNotice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.deleteNoticeUseCase.execute(Number(req.params.id));

      res.status(200).json(
        ApiResponse.success({
          message: "Notice deleted successfully",
          data: null,
        })
      );
    } catch (error) {
      next(error);
    }
  };

  togglePin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const notice = await this.togglePinNoticeUseCase.execute(Number(req.params.id));

      res.status(200).json(
        ApiResponse.success({
          message: notice.isPinned ? "Notice pinned successfully" : "Notice unpinned successfully",
          data: notice.toResponseObject(),
        })
      );
    } catch (error) {
      next(error);
    }
  };
}