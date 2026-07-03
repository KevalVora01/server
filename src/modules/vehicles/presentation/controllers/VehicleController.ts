import type { Request, Response, NextFunction } from "express";
import { CreateVehicleUseCase } from "../../application/use-cases/CreateVehicleUseCase";
import { GetVehiclesUseCase } from "../../application/use-cases/GetVehiclesUseCase";
import { UpdateVehicleUseCase } from "../../application/use-cases/UpdateVehicleUseCase";
import { DeleteVehicleUseCase } from "../../application/use-cases/DeleteVehicleUseCase";
import { ApiResponse } from "../../../../shared/utils/apiResponse";

export class VehicleController {
  constructor(
    private readonly createVehicleUseCase: CreateVehicleUseCase,
    private readonly getVehiclesUseCase: GetVehiclesUseCase,
    private readonly updateVehicleUseCase: UpdateVehicleUseCase,
    private readonly deleteVehicleUseCase: DeleteVehicleUseCase,
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
        ApiResponse.success({
          message: "Vehicle added successfully",
          data: vehicle.toResponseObject(),
        })
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
      const residentId = Number(req.params.residentId);

      const vehicles = await this.getVehiclesUseCase.execute(residentId);

      res.status(200).json(
        ApiResponse.success({
          message: "Vehicles fetched successfully",
          data: vehicles.map((v) => v.toResponseObject()),
        })
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
        ApiResponse.success({
          message: "Vehicle updated successfully",
          data: vehicle.toResponseObject(),
        })
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
        ApiResponse.success({
          message: "Vehicle removed successfully",
          data: null,
        })
      );
    } catch (error) {
      next(error);
    }
  };
}