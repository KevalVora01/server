import type { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../../../../shared/utils/apiResponse";
import { AuthenticatedRequest } from "../../../../shared/types/AuthenticatedRequest";
import { UserRole } from "../../../auth/domain/entities/User";
import { RequestingUser } from "../../../../shared/types/RequestingUser";
import { IResidentRepository } from "../../../residents/domain/repositories/IResidentRepository";

import { CreateBookingUseCase } from "../../application/use-cases/CreateBookingUseCase";
import { ListMyBookingsUseCase } from "../../application/use-cases/ListMyBookingsUseCase";
import { ListBookingsUseCase, ListBookingsFilters } from "../../application/use-cases/ListBookingsUseCase";
import { GetBookingUseCase } from "../../application/use-cases/GetBookingUseCase";
import { CancelBookingUseCase } from "../../application/use-cases/CancelBookingUseCase";
import { ApproveBookingUseCase } from "../../application/use-cases/ApproveBookingUseCase";
import { RejectBookingUseCase } from "../../application/use-cases/RejectBookingUseCase";
import { SettleBookingUseCase } from "../../application/use-cases/SettleBookingUseCase";
import { GetBookingStatsUseCase } from "../../application/use-cases/GetBookingStatsUseCase";
import { GetBookingDetailUseCase } from "../../application/use-cases/GetBookingDetailUseCase";
import { BulkRecordBookingVotesUseCase } from "../../application/use-cases/BulkRecordBookingVotesUseCase";
import { FinalizeBookingUseCase } from "../../application/use-cases/FinalizeBookingUseCase";

export class BookingController {
  constructor(
    private readonly createBookingUseCase: CreateBookingUseCase,
    private readonly listMyBookingsUseCase: ListMyBookingsUseCase,
    private readonly listBookingsUseCase: ListBookingsUseCase,
    private readonly getBookingUseCase: GetBookingUseCase,
    private readonly cancelBookingUseCase: CancelBookingUseCase,
    private readonly approveBookingUseCase: ApproveBookingUseCase,
    private readonly rejectBookingUseCase: RejectBookingUseCase,
    private readonly settleBookingUseCase: SettleBookingUseCase,
    private readonly getBookingStatsUseCase: GetBookingStatsUseCase,
    private readonly getBookingDetailUseCase: GetBookingDetailUseCase,
    private readonly bulkRecordBookingVotesUseCase: BulkRecordBookingVotesUseCase,
    private readonly finalizeBookingUseCase: FinalizeBookingUseCase,
    private readonly residentRepository: IResidentRepository
  ) {}

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

  createBooking = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const requestingUser = await this.buildRequestingUser(authReq);
      const booking = await this.createBookingUseCase.execute(req.body, requestingUser);
      res.status(201).json(
        ApiResponse.success(booking.toResponseObject(), "Booking request submitted successfully")
      );
    } catch (error) {
      next(error);
    }
  };

  listMyBookings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const resident = await this.residentRepository.findByUserId(authReq.user.userId);
      if (!resident) {
        res.status(404).json(ApiResponse.error("Resident profile not found for this user"));
        return;
      }
      const scope = (req.query.scope as "upcoming" | "past") || "upcoming";
      const bookings = await this.listMyBookingsUseCase.execute(resident.id!, scope);
      res.status(200).json(
        ApiResponse.success(
          bookings.map((b) => b.toResponseObject()),
          "Your bookings fetched successfully"
        )
      );
    } catch (error) {
      next(error);
    }
  };

  listBookings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters: ListBookingsFilters = {
        amenityId: req.query.amenityId ? Number(req.query.amenityId) : undefined,
        date: req.query.date ? String(req.query.date) : undefined,
        status: req.query.status ? (String(req.query.status) as ListBookingsFilters["status"]) : undefined,
        residentId: req.query.residentId ? Number(req.query.residentId) : undefined,
      };
      const bookings = await this.listBookingsUseCase.execute(filters);
      res.status(200).json(
        ApiResponse.success(
          bookings.map((b) => b.toResponseObject()),
          "Bookings fetched successfully"
        )
      );
    } catch (error) {
      next(error);
    }
  };

  getStats = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.getBookingStatsUseCase.execute();
      res.status(200).json(ApiResponse.success(stats, "Booking stats fetched successfully"));
    } catch (error) {
      next(error);
    }
  };

  getBooking = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const requestingUser = await this.buildRequestingUser(authReq);
      const booking = await this.getBookingUseCase.execute(Number(req.params.id), requestingUser);
      res.status(200).json(
        ApiResponse.success(booking.toResponseObject(), "Booking fetched successfully")
      );
    } catch (error) {
      next(error);
    }
  };

  cancelBooking = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const requestingUser = await this.buildRequestingUser(authReq);
      const booking = await this.cancelBookingUseCase.execute(
        Number(req.params.id),
        { reason: req.body.reason },
        requestingUser
      );
      res.status(200).json(
        ApiResponse.success(booking.toResponseObject(), "Booking cancelled successfully")
      );
    } catch (error) {
      next(error);
    }
  };

  approveBooking = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const requestingUser = await this.buildRequestingUser(authReq);
      const booking = await this.approveBookingUseCase.execute(Number(req.params.id), requestingUser);
      res.status(200).json(
        ApiResponse.success(booking.toResponseObject(), "Booking approved successfully")
      );
    } catch (error) {
      next(error);
    }
  };

  rejectBooking = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const booking = await this.rejectBookingUseCase.execute(Number(req.params.id), {
        reason: req.body.reason,
      });
      res.status(200).json(
        ApiResponse.success(booking.toResponseObject(), "Booking rejected successfully")
      );
    } catch (error) {
      next(error);
    }
  };

  settleBooking = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const requestingUser = await this.buildRequestingUser(authReq);
      const booking = await this.settleBookingUseCase.execute(
        Number(req.params.id),
        { paymentRef: req.body.paymentRef },
        requestingUser
      );
      res.status(200).json(
        ApiResponse.success(booking.toResponseObject(), "Booking payment recorded successfully")
      );
    } catch (error) {
      next(error);
    }
  };

  getBookingDetail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const detail = await this.getBookingDetailUseCase.execute(id);
      res.status(200).json(
        ApiResponse.success(
          {
            ...detail.booking.toResponseObject(),
            amenity: detail.amenity ? detail.amenity.toResponseObject() : null,
            resident: detail.resident,
            votes: detail.votes.map((v) => v.toResponseObject()),
            committeeMembers: detail.committeeMembers,
          },
          "Booking detail fetched successfully"
        )
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

      const recorded = await this.bulkRecordBookingVotesUseCase.execute(
        id,
        { votes: votes ?? [], adminVote },
        authReq.user.userId
      );

      res.status(200).json(
        ApiResponse.success(
          recorded.map((v) => v.toResponseObject()),
          "Votes recorded successfully"
        )
      );
    } catch (error) {
      next(error);
    }
  };

  finalizeBooking = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const id = Number(req.params.id);
      const booking = await this.finalizeBookingUseCase.execute(id, authReq.user.userId);

      res.status(200).json(
        ApiResponse.success(booking.toResponseObject(), "Booking request finalized successfully")
      );
    } catch (error) {
      next(error);
    }
  };
}
