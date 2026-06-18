import type { Request, Response, NextFunction } from "express";

import { CreateResidentUseCase } from "../../application/use-cases/CreateResidentUseCase";
import { GetResidentUseCase } from "../../application/use-cases/GetResidentUseCase";
import { ListResidentsUseCase } from "../../application/use-cases/ListResidentsUseCase";
import { UpdateResidentUseCase } from "../../application/use-cases/UpdateResidentUseCase";
import { DeactivateResidentUseCase } from "../../application/use-cases/DeactivateResidentUseCase";

import { ApiResponse } from "../../../../shared/utils/apiResponse";

export class ResidentController {
  constructor(
    private readonly createResidentUseCase: CreateResidentUseCase,
    private readonly getResidentUseCase: GetResidentUseCase,
    private readonly listResidentsUseCase: ListResidentsUseCase,
    private readonly updateResidentUseCase: UpdateResidentUseCase,
    private readonly deactivateResidentUseCase: DeactivateResidentUseCase
  ) {}

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
      const resident = await this.getResidentUseCase.execute(
        Number(req.params.id)
      );

      res.status(200).json(
        ApiResponse.success({
          message: "Resident fetched successfully",
          data: resident.toResponseObject(),
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
      const result = await this.listResidentsUseCase.execute({
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
          data: result,
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
}