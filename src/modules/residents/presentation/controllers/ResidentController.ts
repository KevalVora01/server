import type { Request, Response, NextFunction } from "express";

import { CreateResidentUseCase } from "../../application/use-cases/CreateResidentUseCase";
import { GetResidentUseCase } from "../../application/use-cases/GetResidentUseCase";
import { ListResidentsUseCase } from "../../application/use-cases/ListResidentsUseCase";
import { UpdateResidentUseCase } from "../../application/use-cases/UpdateResidentUseCase";
import { DeactivateResidentUseCase } from "../../application/use-cases/DeactivateResidentUseCase";
import { ListApartmentTenantsUseCase } from "../../application/use-cases/ListApartmentTenantsUseCase";
import { ImportResidentsUseCase } from "../../application/use-cases/ImportResidentsUseCase";

import { ApiResponse } from "../../../../shared/utils/apiResponse";
import { AuthenticatedRequest } from "../../../../shared/types/AuthenticatedRequest";
import { IResidentRepository } from "../../domain/repositories/IResidentRepository";

export class ResidentController {
  constructor(
    private readonly createResidentUseCase: CreateResidentUseCase,
    private readonly getResidentUseCase: GetResidentUseCase,
    private readonly listResidentsUseCase: ListResidentsUseCase,
    private readonly updateResidentUseCase: UpdateResidentUseCase,
    private readonly deactivateResidentUseCase: DeactivateResidentUseCase,
    private readonly listApartmentTenantsUseCase: ListApartmentTenantsUseCase,
    private readonly residentRepository: IResidentRepository,
    private readonly importResidentsUseCase: ImportResidentsUseCase
  ) { }

  createResident = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const resident = await this.createResidentUseCase.execute(req.body);

      res.status(201).json(
        ApiResponse.success({
          message: "Resident created successfully",
          data: resident.toResponseObject(),
        })
      );
    } catch (error) {
      next(error);
    }
  };

  getResident = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const resident = await this.getResidentUseCase.execute(Number(req.params.id));

      res.status(200).json(
        ApiResponse.success({
          message: "Resident fetched successfully",
          data: {
            ...resident.toResponseObject(),
            user: (resident as any).user ?? null,
            apartment: (resident as any).apartment ?? null,
          },
        })
      );
    } catch (error) {
      next(error);
    }
  };

  listResidents = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { list, stats } = await this.listResidentsUseCase.execute({
        pageNumber: Number(req.query.pageNumber) || 1,
        pageSize: Number(req.query.pageSize) || 10,
        apartmentId: req.query.apartmentId
          ? Number(req.query.apartmentId)
          : undefined,
        isActive: req.query.isActive !== undefined
          ? req.query.isActive === "true"
          : undefined,
        isOwner: req.query.isOwner !== undefined
          ? req.query.isOwner === "true"
          : undefined,
        search: req.query.search as string | undefined,
      });

      res.status(200).json(
        ApiResponse.success({
          message: "Residents fetched successfully",
          data: {
            ...list,
            items: list.items.map((r) => r.toResponseObject()),
            stats: {
              totalCount: stats.totalCount,
              totalActive: stats.totalActive,
              totalOwners: stats.totalOwners,
              totalTenants: stats.totalTenants,
            },
          },
        })
      );
    } catch (error) {
      next(error);
    }
  };

  updateResident = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const resident = await this.updateResidentUseCase.execute(
        Number(req.params.id),
        req.body
      );

      res.status(200).json(
        ApiResponse.success({
          message: "Resident updated successfully",
          data: resident.toResponseObject(),
        })
      );
    } catch (error) {
      next(error);
    }
  };

  deactivateResident = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      await this.deactivateResidentUseCase.execute(Number(req.params.id));

      res.status(200).json(
        ApiResponse.success({
          message: "Resident deactivated successfully",
          data: null,
        })
      );
    } catch (error) {
      next(error);
    }
  };

  listApartmentTenants = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const owner = await this.residentRepository.findByUserId(authReq.user.userId);

      if (!owner) {
        res.status(404).json(ApiResponse.error("Resident profile not found"));
        return;
      }

      if (!owner.isOwner) {
        res.status(403).json(ApiResponse.error("Only the apartment owner can view tenant history"));
        return;
      }

      const tenants = await this.listApartmentTenantsUseCase.execute(owner.apartmentId);
      res.status(200).json(
        ApiResponse.success(
          tenants.map((t) => t.toResponseObject()),
          "Tenant history fetched successfully"
        )
      );
    } catch (error) {
      next(error);
    }
  };

  getMyResident = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const resident = await this.residentRepository.findByUserId(authReq.user.userId);

      if (!resident) {
        res.status(404).json(ApiResponse.error("Resident profile not found"));
        return;
      }

      res.status(200).json(
        ApiResponse.success(resident.toResponseObject(), "Resident profile fetched successfully")
      );
    } catch (error) {
      next(error);
    }
  };

  promoteOccupants = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const promoted = await this.residentRepository.promoteDueOccupants();
      res.status(200).json(
        ApiResponse.success({ promoted }, "Occupant promotion completed")
      );
    } catch (error) {
      next(error);
    }
  };

  importResidents = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json(
          ApiResponse.error("Excel file is required")
        );
        return;
      }

      const result = await this.importResidentsUseCase.execute(req.file.buffer);

      res.status(201).json(
        ApiResponse.success(
          result,
          `Successfully imported ${result.successCount} residents.`
        )
      );
    } catch (error) {
      next(error);
    }
  };
}