import type { Request, Response, NextFunction } from "express";
import { CreateComplaintUseCase } from "../../application/use-cases/CreateComplaintUseCase";
import { GetComplaintUseCase } from "../../application/use-cases/GetComplaintUseCase";
import { ListComplaintsUseCase } from "../../application/use-cases/ListComplaintsUseCase";
import { ListMyComplaintsUseCase } from "../../application/use-cases/ListMyComplaintsUseCase";
import { UpdateComplaintStatusUseCase } from "../../application/use-cases/UpdateComplaintStatusUseCase";
import { AddCommentUseCase } from "../../application/use-cases/AddCommentUseCase";
import { ListCommentsUseCase } from "../../application/use-cases/ListCommentsUseCase";
import { ApiResponse } from "../../../../shared/utils/apiResponse";
import { AuthenticatedRequest } from "../../../../shared/types/AuthenticatedRequest";
import { UserRole } from "../../../auth/domain/entities/User";
import { RequestingUser } from "../../application/dtos/RequestingUser";
import { IResidentRepository } from "../../../residents/domain/repositories/IResidentRepository";
import { CloudinaryService } from "../../../../shared/services/CloudinaryService";

export class ComplaintController {
  constructor(
    private readonly createComplaintUseCase: CreateComplaintUseCase,
    private readonly getComplaintUseCase: GetComplaintUseCase,
    private readonly listComplaintsUseCase: ListComplaintsUseCase,
    private readonly listMyComplaintsUseCase: ListMyComplaintsUseCase,
    private readonly updateComplaintStatusUseCase: UpdateComplaintStatusUseCase,
    private readonly addCommentUseCase: AddCommentUseCase,
    private readonly listCommentsUseCase: ListCommentsUseCase,
    private readonly residentRepository: IResidentRepository,
    private readonly cloudinaryService: CloudinaryService,
  ) { }

  private async buildRequestingUser(authReq: AuthenticatedRequest): Promise<RequestingUser> {
    const requestingUser: RequestingUser = {
      userId: authReq.user.userId,
      role: authReq.user.role,
    };

    if (authReq.user.role === UserRole.RESIDENT) {
      const resident = await this.residentRepository.findByUserId(authReq.user.userId);
      requestingUser.residentId = resident?.id;
    }

    return requestingUser;
  }

  createComplaint = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const resident = await this.residentRepository.findByUserId(authReq.user.userId);

      if (!resident) {
        res.status(404).json(
          ApiResponse.error("Resident profile not found for this user")
        );
        return;
      }

      const files = (req.files as Express.Multer.File[]) || [];
      const imageUrls = files.length > 0
        ? await this.cloudinaryService.uploadImages(files, "complaints")
        : [];

      const complaint = await this.createComplaintUseCase.execute({
        residentId: resident.id!,
        title: req.body.title,
        description: req.body.description,
        priority: req.body.priority,
        imageUrls,
      });

      res.status(201).json(
        ApiResponse.success({
          message: "Complaint created successfully",
          data: complaint.toResponseObject(),
        })
      );
    } catch (error) {
      next(error);
    }
  };

  getComplaint = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const requestingUser = await this.buildRequestingUser(authReq);

      const { complaint, images } = await this.getComplaintUseCase.execute(
        Number(req.params.id),
        requestingUser
      );

      res.status(200).json(
        ApiResponse.success({
          message: "Complaint fetched successfully",
          data: {
            ...complaint.toResponseObject(),
            images: images.map((img) => img.toResponseObject()),
          },
        })
      );
    } catch (error) {
      next(error);
    }
  };

  listComplaints = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.listComplaintsUseCase.execute({
        pageNumber: Number(req.query.pageNumber) || 1,
        pageSize: Number(req.query.pageSize) || 10,
        status: req.query.status as any,
        priority: req.query.priority as any,
        search: req.query.search as string | undefined,
      });

      res.status(200).json(
        ApiResponse.success({
          message: "Complaints fetched successfully",
          data: {
            ...result,
            items: result.items.map((c) => c.toResponseObject()),
          },
        })
      );
    } catch (error) {
      next(error);
    }
  };

  listMyComplaints = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const resident = await this.residentRepository.findByUserId(authReq.user.userId);

      if (!resident) {
        res.status(404).json(
          ApiResponse.error("Resident profile not found for this user")
        );
        return;
      }

      const result = await this.listMyComplaintsUseCase.execute(resident.id!, {
        pageNumber: Number(req.query.pageNumber) || 1,
        pageSize: Number(req.query.pageSize) || 10,
      });

      res.status(200).json(
        ApiResponse.success({
          message: "Your complaints fetched successfully",
          data: {
            ...result,
            items: result.items.map((c) => c.toResponseObject()),
          },
        })
      );
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const complaint = await this.updateComplaintStatusUseCase.execute({
        complaintId: Number(req.params.id),
        status: req.body.status,
      });

      res.status(200).json(
        ApiResponse.success({
          message: "Complaint status updated successfully",
          data: complaint.toResponseObject(),
        })
      );
    } catch (error) {
      next(error);
    }
  };

  addComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const requestingUser = await this.buildRequestingUser(authReq);

      const comment = await this.addCommentUseCase.execute(
        {
          complaintId: Number(req.params.id),
          userId: authReq.user.userId,
          content: req.body.content,
        },
        requestingUser
      );

      res.status(201).json(
        ApiResponse.success({
          message: "Comment added successfully",
          data: comment.toResponseObject(),
        })
      );
    } catch (error) {
      next(error);
    }
  };

  listComments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const requestingUser = await this.buildRequestingUser(authReq);

      const comments = await this.listCommentsUseCase.execute(
        Number(req.params.id),
        requestingUser
      );

      res.status(200).json(
        ApiResponse.success({
          message: "Comments fetched successfully",
          data: comments.map((c) => c.toResponseObject()),
        })
      );
    } catch (error) {
      next(error);
    }
  };
}