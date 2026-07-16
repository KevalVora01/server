import type { Request, Response, NextFunction } from "express";
import { FinalizeTenantRequestUseCase } from "../../application/use-cases/FinalizeTenantRequestUseCase";
import { RevokeTenancyUseCase } from "../../application/use-cases/RevokeTenancyUseCase";
import { ITenantRequestRepository } from "../../domain/repositories/ITenantRequestRepository";
import { ITenantRequestVoteRepository } from "../../domain/repositories/ITenantRequestVoteRepository";
import { ApiResponse } from "../../../../shared/utils/apiResponse";
import { AuthenticatedRequest } from "../../../../shared/types/AuthenticatedRequest";
import { IResidentRepository } from "../../../residents/domain/repositories/IResidentRepository";
import { SubmitTenantRequestUseCase } from "../../application/use-cases/SubmitTenantRequestUseCase";
import { RecordVoteUseCase } from "../../application/use-cases/RecordVoteUseCase";

export class TenantRequestController {
  constructor(
    private readonly submitTenantRequestUseCase: SubmitTenantRequestUseCase,
    private readonly recordVoteUseCase: RecordVoteUseCase,
    private readonly finalizeTenantRequestUseCase: FinalizeTenantRequestUseCase,
    private readonly revokeTenancyUseCase: RevokeTenancyUseCase,
    private readonly tenantRequestRepository: ITenantRequestRepository,
    private readonly tenantRequestVoteRepository: ITenantRequestVoteRepository,
    private readonly residentRepository: IResidentRepository,
  ) { }

  submitRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const owner = await this.residentRepository.findByUserId(authReq.user.userId);

      if (!owner) {
        res.status(404).json(ApiResponse.error("Resident profile not found"));
        return;
      }

      const request = await this.submitTenantRequestUseCase.execute({
        apartmentId: owner.apartmentId,
        requestedBy: owner.id!,
        tenantName: req.body.tenantName,
        tenantEmail: req.body.tenantEmail,
        tenantPhone: req.body.tenantPhone,
        moveInDate: new Date(req.body.moveInDate),
      });

      res.status(201).json(
        ApiResponse.success(request.toResponseObject(), "Tenant request submitted successfully")
      );
    } catch (error) {
      next(error);
    }
  };

  listRequests = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.tenantRequestRepository.findAll({
        pageNumber: Number(req.query.pageNumber) || 1,
        pageSize: Number(req.query.pageSize) || 10,
        status: req.query.status as any,
      });

      res.status(200).json(
        ApiResponse.success(
          { ...result, items: result.items.map((r) => r.toResponseObject()) },
          "Tenant requests fetched successfully"
        )
      );
    } catch (error) {
      next(error);
    }
  };

  getRequestDetail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const request = await this.tenantRequestRepository.findById(Number(req.params.id));

      if (!request) {
        res.status(404).json(ApiResponse.error("Tenant request not found"));
        return;
      }

      const [votes, committeeMembers] = await Promise.all([
        this.tenantRequestVoteRepository.findByRequestId(request.id!),
        this.residentRepository.findCommitteeMembers(),
      ]);

      res.status(200).json(
        ApiResponse.success(
          {
            ...request.toResponseObject(),
            votes: votes.map((v) => v.toResponseObject()),
            committeeMembers: committeeMembers.map((m) => m.toResponseObject()),
          },
          "Tenant request detail fetched successfully"
        )
      );
    } catch (error) {
      next(error);
    }
  };

  recordVote = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;

      const vote = await this.recordVoteUseCase.execute({
        tenantRequestId: Number(req.params.id),
        committeeMemberId: req.body.committeeMemberId,
        vote: req.body.vote,
        recordedByAdminId: authReq.user.userId,
      });

      res.status(201).json(
        ApiResponse.success(vote.toResponseObject(), "Vote recorded successfully")
      );
    } catch (error) {
      next(error);
    }
  };

  finalizeRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.finalizeTenantRequestUseCase.execute({
        tenantRequestId: Number(req.params.id),
      });

      res.status(200).json(
        ApiResponse.success(
          {
            request: result.request.toResponseObject(),
            approved: result.approved,
            newResident: result.newResident?.toResponseObject() ?? null,
          },
          result.approved ? "Tenant request approved" : "Tenant request rejected"
        )
      );
    } catch (error) {
      next(error);
    }
  };

  revokeTenancy = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const owner = await this.residentRepository.findByUserId(authReq.user.userId);

      if (!owner) {
        res.status(404).json(ApiResponse.error("Resident profile not found"));
        return;
      }

      await this.revokeTenancyUseCase.execute(owner.apartmentId);

      res.status(200).json(
        ApiResponse.success(null, "Tenancy revoked successfully")
      );
    } catch (error) {
      next(error);
    }
  };
}