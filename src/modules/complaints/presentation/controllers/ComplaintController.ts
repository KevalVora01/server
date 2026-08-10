import type { Request, Response, NextFunction } from "express";
import { CreateComplaintUseCase } from "../../application/use-cases/CreateComplaintUseCase";
import { GetComplaintUseCase } from "../../application/use-cases/GetComplaintUseCase";
import { ListComplaintsUseCase } from "../../application/use-cases/ListComplaintsUseCase";
import { ListMyComplaintsUseCase } from "../../application/use-cases/ListMyComplaintsUseCase";
import { ListApartmentComplaintsUseCase } from "../../application/use-cases/ListApartmentComplaintsUseCase";
import { UpdateComplaintStatusUseCase } from "../../application/use-cases/UpdateComplaintStatusUseCase";
import { AddCommentUseCase } from "../../application/use-cases/AddCommentUseCase";
import { ListCommentsUseCase } from "../../application/use-cases/ListCommentsUseCase";
import { DeleteComplaintUseCase } from "../../application/use-cases/DeleteComplaintUseCase";
import { ApiResponse } from "../../../../shared/utils/apiResponse";
import { AuthenticatedRequest } from "../../../../shared/types/AuthenticatedRequest";
import { ComplaintStatus, ComplaintPriority } from "../../domain/entities/Complaint";
import { UserRole } from "../../../auth/domain/entities/User";
import { RequestingUser } from "../../../../shared/types/RequestingUser";
import { IResidentRepository } from "../../../residents/domain/repositories/IResidentRepository";
import { CloudinaryService } from "../../../../shared/services/CloudinaryService";

export class ComplaintController {
  constructor(
    private readonly createComplaintUseCase: CreateComplaintUseCase,
    private readonly getComplaintUseCase: GetComplaintUseCase,
    private readonly listComplaintsUseCase: ListComplaintsUseCase,
    private readonly listMyComplaintsUseCase: ListMyComplaintsUseCase,
    private readonly listApartmentComplaintsUseCase: ListApartmentComplaintsUseCase,
    private readonly updateComplaintStatusUseCase: UpdateComplaintStatusUseCase,
    private readonly addCommentUseCase: AddCommentUseCase,
    private readonly listCommentsUseCase: ListCommentsUseCase,
    private readonly residentRepository: IResidentRepository,
    private readonly cloudinaryService: CloudinaryService,
    private readonly deleteComplaintUseCase: DeleteComplaintUseCase,
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
        ApiResponse.success(complaint.toResponseObject(), "Complaint created successfully")
      );
    } catch (error) {
      next(error);
    }
  };

  getComplaint = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const requestingUser = await this.buildRequestingUser(authReq);

      const complaint = await this.getComplaintUseCase.execute(
        Number(req.params.id),
        requestingUser
      );

      res.status(200).json(
        ApiResponse.success(
          complaint.toResponseObject(),
          "Complaint fetched successfully"
        )
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
        status: req.query.status ? (req.query.status as unknown as ComplaintStatus) : undefined,
        priority: req.query.priority ? (req.query.priority as unknown as ComplaintPriority) : undefined,
        search: req.query.search as string | undefined,
      });

      res.status(200).json(
        ApiResponse.success(
          { ...result, items: result.items.map((c) => c.toResponseObject()) },
          "Complaints fetched successfully"
        )
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
        status: req.query.status ? (req.query.status as unknown as ComplaintStatus) : undefined,
        priority: req.query.priority ? (req.query.priority as unknown as ComplaintPriority) : undefined,
        search: req.query.search as string | undefined,
      });

      res.status(200).json(
        ApiResponse.success(
          { ...result, items: result.items.map((c) => c.toResponseObject()) },
          "Your complaints fetched successfully"
        )
      );
    } catch (error) {
      next(error);
    }
  };

  listApartmentComplaints = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const resident = await this.residentRepository.findByUserId(authReq.user.userId);

      if (!resident) {
        res.status(404).json(
          ApiResponse.error("Resident profile not found for this user")
        );
        return;
      }

      const result = await this.listApartmentComplaintsUseCase.execute(resident.id!, {
        pageNumber: Number(req.query.pageNumber) || 1,
        pageSize: Number(req.query.pageSize) || 10,
        status: req.query.status ? (req.query.status as unknown as ComplaintStatus) : undefined,
        priority: req.query.priority ? (req.query.priority as unknown as ComplaintPriority) : undefined,
        search: req.query.search as string | undefined,
      });

      res.status(200).json(
        ApiResponse.success(
          { ...result, items: result.items.map((c) => c.toResponseObject()) },
          "Apartment complaints fetched successfully"
        )
      );
    } catch (error) {
      next(error);
    }
  };

  deleteComplaint = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const requestingUser = await this.buildRequestingUser(authReq);

      await this.deleteComplaintUseCase.execute(
        Number(req.params.id),
        requestingUser
      );

      res.status(200).json(
        ApiResponse.success(null, "Complaint deleted successfully")
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
        ApiResponse.success(complaint.toResponseObject(), "Complaint status updated successfully")
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
        ApiResponse.success(comment.toResponseObject(), "Comment added successfully")
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
        ApiResponse.success(comments.map((c) => c.toResponseObject()), "Comments fetched successfully")
      );
    } catch (error) {
      next(error);
    }
  };

}