import type { Request, Response, NextFunction } from "express";
import { CreateVehicleUseCase } from "../../application/use-cases/CreateVehicleUseCase";
import { GetVehiclesUseCase } from "../../application/use-cases/GetVehiclesUseCase";
import { UpdateVehicleUseCase } from "../../application/use-cases/UpdateVehicleUseCase";
import { DeleteVehicleUseCase } from "../../application/use-cases/DeleteVehicleUseCase";
import { ListApartmentVehiclesUseCase } from "../../application/use-cases/ListApartmentVehiclesUseCase";
import { IResidentRepository } from "../../../residents/domain/repositories/IResidentRepository";
import { ApiResponse } from "../../../../shared/utils/apiResponse";
import { AuthenticatedRequest } from "../../../../shared/types/AuthenticatedRequest";
import { UserRole } from "../../../auth/domain/entities/User";

export class VehicleController {
  constructor(
    private readonly createVehicleUseCase: CreateVehicleUseCase,
    private readonly getVehiclesUseCase: GetVehiclesUseCase,
    private readonly updateVehicleUseCase: UpdateVehicleUseCase,
    private readonly deleteVehicleUseCase: DeleteVehicleUseCase,
    private readonly listApartmentVehiclesUseCase: ListApartmentVehiclesUseCase,
    private readonly residentRepository: IResidentRepository,
  ) { }

  createVehicle = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const residentId = Number(req.params.residentId);

      const vehicle = await this.createVehicleUseCase.execute({
        residentId,
        ...req.body,
      });

      res.status(201).json(
        ApiResponse.success(vehicle.toResponseObject(), "Vehicle added successfully")
      );
    } catch (error) {
      next(error);
    }
  };

  getVehicles = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const residentId = Number(req.params.residentId);

      if (authReq.user.role === UserRole.RESIDENT) {
        const requester = await this.residentRepository.findByUserId(authReq.user.userId);
        if (!requester || requester.id !== residentId) {
          res.status(403).json(ApiResponse.error("You can only view your own vehicles"));
          return;
        }
      }

      const vehicles = await this.getVehiclesUseCase.execute(residentId);

      res.status(200).json(
        ApiResponse.success(vehicles.map((v) => v.toResponseObject()), "Vehicles fetched successfully")
      );
    } catch (error) {
      next(error);
    }
  };

  listApartmentVehicles = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const requester = await this.residentRepository.findByUserId(authReq.user.userId);

      if (!requester) {
        res.status(404).json(ApiResponse.error("Resident profile not found"));
        return;
      }

      const vehicles = await this.listApartmentVehiclesUseCase.execute(requester.id!);

      res.status(200).json(
        ApiResponse.success(vehicles.map((v) => v.toResponseObject()), "Apartment vehicles fetched successfully")
      );
    } catch (error) {
      next(error);
    }
  };

  updateVehicle = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const residentId = Number(req.params.residentId);
      const id = Number(req.params.id);

      const vehicle = await this.updateVehicleUseCase.execute(id, residentId, req.body);

      res.status(200).json(
        ApiResponse.success(vehicle.toResponseObject(), "Vehicle updated successfully")
      );
    } catch (error) {
      next(error);
    }
  };

  deleteVehicle = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const residentId = Number(req.params.residentId);
      const id = Number(req.params.id);

      await this.deleteVehicleUseCase.execute(id, residentId);

      res.status(200).json(
        ApiResponse.success(null, "Vehicle removed successfully")
      );
    } catch (error) {
      next(error);
    }
  };
}