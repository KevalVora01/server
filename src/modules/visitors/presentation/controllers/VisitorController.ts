import type { Request, Response, NextFunction } from "express";
import { PreRegisterVisitorUseCase } from "../../application/use-cases/PreRegisterVisitorUseCase";
import { LogWalkInVisitorUseCase } from "../../application/use-cases/LogWalkInVisitorUseCase";
import { RespondToApprovalUseCase } from "../../application/use-cases/RespondToApprovalUseCase";
import { CheckInVisitorUseCase } from "../../application/use-cases/CheckInVisitorUseCase";
import { CheckOutVisitorUseCase } from "../../application/use-cases/CheckOutVisitorUseCase";
import { CancelPreRegisteredVisitorUseCase } from "../../application/use-cases/CancelPreRegisteredVisitorUseCase";
import { ListVisitorsUseCase } from "../../application/use-cases/ListVisitorsUseCase";
import { ListMyVisitorsUseCase } from "../../application/use-cases/ListMyVisitorsUseCase";
import { ListCurrentlyInsideUseCase } from "../../application/use-cases/ListCurrentlyInsideUseCase";
import { GetDashboardMetricsUseCase } from "../../application/use-cases/GetDashboardMetricsUseCase";
import { IResidentRepository } from "../../../residents/domain/repositories/IResidentRepository";
import { IVisitorRepository } from "../../domain/repositories/IVisitorRepository";
import { CloudinaryService } from "../../../../shared/services/CloudinaryService";
import { ApiResponse } from "../../../../shared/utils/apiResponse";
import { AuthenticatedRequest } from "../../../../shared/types/AuthenticatedRequest";
import { SearchPreRegisteredVisitorsUseCase } from "../../application/use-cases/SearchPreRegisteredVisitorsUseCase";
import { getIO } from "../../../../shared/socket/socket.server";
import { Rooms } from "../../../../shared/socket/socket.rooms";
import { SOCKET_EVENTS } from "../../../../shared/socket/socket.events";

export class VisitorController {
  constructor(
    private readonly preRegisterVisitorUseCase: PreRegisterVisitorUseCase,
    private readonly logWalkInVisitorUseCase: LogWalkInVisitorUseCase,
    private readonly respondToApprovalUseCase: RespondToApprovalUseCase,
    private readonly checkInVisitorUseCase: CheckInVisitorUseCase,
    private readonly checkOutVisitorUseCase: CheckOutVisitorUseCase,
    private readonly cancelPreRegisteredVisitorUseCase: CancelPreRegisteredVisitorUseCase,
    private readonly listVisitorsUseCase: ListVisitorsUseCase,
    private readonly listMyVisitorsUseCase: ListMyVisitorsUseCase,
    private readonly listCurrentlyInsideUseCase: ListCurrentlyInsideUseCase,
    private readonly getDashboardMetricsUseCase: GetDashboardMetricsUseCase,
    private readonly searchPreRegisteredVisitorsUseCase: SearchPreRegisteredVisitorsUseCase,
    private readonly residentRepository: IResidentRepository,
    private readonly visitorRepository: IVisitorRepository,
    private readonly cloudinaryService: CloudinaryService,
  ) { }

  findById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const visitor = await this.visitorRepository.findById(Number(req.params.id));
      if (!visitor) {
        res.status(404).json(ApiResponse.error("Visitor not found"));
        return;
      }
      res.status(200).json(
        ApiResponse.success(visitor.toResponseObject(), "Visitor fetched successfully")
      );
    } catch (error) {
      next(error);
    }
  };

  preRegister = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const resident = await this.residentRepository.findByUserId(authReq.user.userId);

      if (!resident) {
        res.status(404).json(ApiResponse.error("Resident profile not found"));
        return;
      }

      const visitor = await this.preRegisterVisitorUseCase.execute({
        residentId: resident.id!,
        apartmentId: resident.apartmentId,
        name: req.body.name,
        phone: req.body.phone,
        purpose: req.body.purpose,
        expectedAt: new Date(req.body.expectedAt),
        vehicleNumber: req.body.vehicleNumber,
      });

      // Notify security in real-time
      try {
        getIO().to(Rooms.role("security")).emit(SOCKET_EVENTS.VISITOR_UPDATED, {
          visitorId: visitor.id,
          status: "Approved",
          type: "pre_registered",
        });
      } catch { /* socket not initialized */ }

      res.status(201).json(
        ApiResponse.success(visitor.toResponseObject(), "Visitor pre-registered successfully")
      );
    } catch (error) {
      next(error);
    }
  };

  logWalkIn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;

      const file = req.file as Express.Multer.File | undefined;
      const photoUrl = file
        ? (await this.cloudinaryService.uploadImages([file], "visitors"))[0]
        : undefined;

      const visitor = await this.logWalkInVisitorUseCase.execute({
        apartmentId: req.body.apartmentId,
        name: req.body.name,
        phone: req.body.phone,
        purpose: req.body.purpose,
        photoUrl,
        vehicleNumber: req.body.vehicleNumber,
        loggedBySecurityId: authReq.user.userId,
      });

      res.status(201).json(
        ApiResponse.success(visitor.toResponseObject(), "Visitor logged successfully")
      );
    } catch (error) {
      next(error);
    }
  };

  respond = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const resident = await this.residentRepository.findByUserId(authReq.user.userId);

      const visitor = await this.respondToApprovalUseCase.execute({
        visitorId: Number(req.params.id),
        decision: req.body.decision,
        residentId: resident?.id,
      });

      // Notify security in real-time
      try {
        getIO().to(Rooms.role("security")).emit(SOCKET_EVENTS.VISITOR_UPDATED, {
          visitorId: visitor.id,
          status: visitor.toResponseObject().status,
        });
      } catch { /* socket not initialized */ }

      res.status(200).json(
        ApiResponse.success(visitor.toResponseObject(), `Visitor ${req.body.decision.toLowerCase()}d`)
      );
    } catch (error) {
      next(error);
    }
  };

  checkIn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;

      const files = (req.files as Express.Multer.File[]) || [];
      const photoUrl = files.length > 0
        ? (await this.cloudinaryService.uploadImages(files, "visitors"))[0]
        : undefined;

      const visitor = await this.checkInVisitorUseCase.execute(Number(req.params.id), authReq.user.userId, photoUrl);

      res.status(200).json(
        ApiResponse.success(visitor.toResponseObject(), "Visitor checked in successfully")
      );
    } catch (error) {
      next(error);
    }
  };

  checkOut = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const visitor = await this.checkOutVisitorUseCase.execute(Number(req.params.id));

      res.status(200).json(
        ApiResponse.success(visitor.toResponseObject(), "Visitor checked out successfully")
      );
    } catch (error) {
      next(error);
    }
  };

  cancel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const resident = await this.residentRepository.findByUserId(authReq.user.userId);

      if (!resident) {
        res.status(404).json(ApiResponse.error("Resident profile not found"));
        return;
      }

      await this.cancelPreRegisteredVisitorUseCase.execute(Number(req.params.id), resident.id!);

      res.status(200).json(
        ApiResponse.success(null, "Visitor registration cancelled")
      );
    } catch (error) {
      next(error);
    }
  };

  listMyVisitors = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const resident = await this.residentRepository.findByUserId(authReq.user.userId);

      if (!resident) {
        res.status(404).json(ApiResponse.error("Resident profile not found"));
        return;
      }

      const result = await this.listMyVisitorsUseCase.execute(resident.id!, {
        pageNumber: Number(req.query.pageNumber) || 1,
        pageSize: Number(req.query.pageSize) || 10,
      });

      res.status(200).json(
        ApiResponse.success(
          { ...result, items: result.items.map((v) => v.toResponseObject()) },
          "Your apartment's visitor history fetched successfully"
        )
      );
    } catch (error) {
      next(error);
    }
  };

  listCurrentlyInside = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const visitors = await this.listCurrentlyInsideUseCase.execute();

      res.status(200).json(
        ApiResponse.success(visitors.map((v) => v.toResponseObject()), "Visitors currently inside fetched successfully")
      );
    } catch (error) {
      next(error);
    }
  };

  listAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.listVisitorsUseCase.execute({
        pageNumber: Number(req.query.pageNumber) || 1,
        pageSize: Number(req.query.pageSize) || 10,
        status: req.query.status as any,
        apartmentId: req.query.apartmentId ? Number(req.query.apartmentId) : undefined,
        search: req.query.search as string | undefined,
      });

      res.status(200).json(
        ApiResponse.success(
          { ...result, items: result.items.map((v) => v.toResponseObject()) },
          "Visitors fetched successfully"
        )
      );
    } catch (error) {
      next(error);
    }
  };

  getDashboardMetrics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const metrics = await this.getDashboardMetricsUseCase.execute();

      res.status(200).json(
        ApiResponse.success(metrics, "Dashboard metrics fetched successfully")
      );
    } catch (error) {
      next(error);
    }
  };

  searchPreRegistered = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = (req.query.q as string) || "";
      const visitors = await this.searchPreRegisteredVisitorsUseCase.execute(query);

      res.status(200).json(
        ApiResponse.success(visitors.map((v) => v.toResponseObject()), "Search results fetched successfully")
      );
    } catch (error) {
      next(error);
    }
  };
}