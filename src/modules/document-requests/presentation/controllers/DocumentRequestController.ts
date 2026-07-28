import type { Request, Response, NextFunction } from "express";
import { CreateDocumentRequestUseCase } from "../../application/use-cases/CreateDocumentRequestUseCase";
import { GetMyRequestsUseCase } from "../../application/use-cases/GetMyRequestsUseCase";
import { GetReceivedRequestsUseCase } from "../../application/use-cases/GetReceivedRequestsUseCase";
import { UploadDocumentUseCase } from "../../application/use-cases/UploadDocumentUseCase";
import { RejectRequestUseCase } from "../../application/use-cases/RejectRequestUseCase";
import { CancelRequestUseCase } from "../../application/use-cases/CancelRequestUseCase";
import { BulkRecordDocumentVotesUseCase } from "../../application/use-cases/BulkRecordDocumentVotesUseCase";
import { FinalizeDocumentRequestUseCase } from "../../application/use-cases/FinalizeDocumentRequestUseCase";
import { GetDocumentRequestDetailUseCase } from "../../application/use-cases/GetDocumentRequestDetailUseCase";
import { ApiResponse } from "../../../../shared/utils/apiResponse";
import { AuthenticatedRequest } from "../../../../shared/types/AuthenticatedRequest";
import { UserRole } from "../../../auth/domain/entities/User";
import { IResidentRepository } from "../../../residents/domain/repositories/IResidentRepository";

export class DocumentRequestController {
  constructor(
    private readonly createDocumentRequestUseCase: CreateDocumentRequestUseCase,
    private readonly getMyRequestsUseCase: GetMyRequestsUseCase,
    private readonly getReceivedRequestsUseCase: GetReceivedRequestsUseCase,
    private readonly uploadDocumentUseCase: UploadDocumentUseCase,
    private readonly rejectRequestUseCase: RejectRequestUseCase,
    private readonly cancelRequestUseCase: CancelRequestUseCase,
    private readonly bulkRecordDocumentVotesUseCase: BulkRecordDocumentVotesUseCase,
    private readonly finalizeDocumentRequestUseCase: FinalizeDocumentRequestUseCase,
    private readonly getDocumentRequestDetailUseCase: GetDocumentRequestDetailUseCase,
    private readonly residentRepository: IResidentRepository,
  ) {}

  createRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;

      const request = await this.createDocumentRequestUseCase.execute(
        {
          documentType: req.body.documentType,
          customDocumentName: req.body.customDocumentName,
          note: req.body.note,
        },
        authReq.user.userId,
      );

      res.status(201).json(
        ApiResponse.success(request.toResponseObject(), "Document request created successfully"),
      );
    } catch (error) {
      next(error);
    }
  };

  getMyRequests = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;

      const resident = await this.residentRepository.findByUserId(authReq.user.userId);
      const requests = await this.getMyRequestsUseCase.execute(resident?.id);

      res.status(200).json(
        ApiResponse.success(requests.map((r) => r.toResponseObject()), "Requests fetched successfully"),
      );
    } catch (error) {
      next(error);
    }
  };

  getReceivedRequests = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const isAdmin = authReq.user.role === UserRole.ADMIN;

      let residentId: number | undefined;
      if (!isAdmin) {
        const resident = await this.residentRepository.findByUserId(authReq.user.userId);
        residentId = resident?.id;
      }

      const requests = await this.getReceivedRequestsUseCase.execute(residentId, isAdmin);

      res.status(200).json(
        ApiResponse.success(requests.map((r) => r.toResponseObject()), "Received requests fetched successfully"),
      );
    } catch (error) {
      next(error);
    }
  };

  uploadDocument = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const file = req.file;

      if (!file) {
        res.status(400).json(ApiResponse.error("No document file uploaded."));
        return;
      }

      const request = await this.uploadDocumentUseCase.execute(id, file.buffer, file.originalname);

      res.status(200).json(
        ApiResponse.success(request.toResponseObject(), "Document uploaded and request fulfilled successfully."),
      );
    } catch (error) {
      next(error);
    }
  };

  rejectRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const { rejectionReason } = req.body;

      const request = await this.rejectRequestUseCase.execute(id, rejectionReason);

      res.status(200).json(
        ApiResponse.success(request.toResponseObject(), "Document request rejected."),
      );
    } catch (error) {
      next(error);
    }
  };

  cancelRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Number(req.params.id);

      await this.cancelRequestUseCase.execute(id);

      res.status(200).json(
        ApiResponse.success(null, "Document request cancelled successfully."),
      );
    } catch (error) {
      next(error);
    }
  };

  getDetail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const detail = await this.getDocumentRequestDetailUseCase.execute(id);

      res.status(200).json(
        ApiResponse.success({
          ...detail.request.toResponseObject(),
          votes: detail.votes.map((v) => v.toResponseObject()),
          committeeMembers: detail.committeeMembers,
        }, "Document request detail fetched successfully."),
      );
    } catch (error) {
      next(error);
    }
  };

  bulkRecordVotes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const id = Number(req.params.id);
      const { votes, adminVote } = req.body;

      const recorded = await this.bulkRecordDocumentVotesUseCase.execute(
        id,
        { votes: votes ?? [], adminVote },
        authReq.user.userId,
      );

      res.status(200).json(
        ApiResponse.success(
          recorded.map((v) => v.toResponseObject()),
          "Votes recorded successfully.",
        ),
      );
    } catch (error) {
      next(error);
    }
  };

  finalizeRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const request = await this.finalizeDocumentRequestUseCase.execute(id);

      res.status(200).json(
        ApiResponse.success(request.toResponseObject(), "Document request finalized successfully."),
      );
    } catch (error) {
      next(error);
    }
  };
}
