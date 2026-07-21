import type { Request, Response, NextFunction } from "express";
import { CreateApartmentUseCase } from "../../application/use-cases/CreateApartmentUseCase";
import { GetApartmentUseCase } from "../../application/use-cases/GetApartmentUseCase";
import { ListApartmentsUseCase } from "../../application/use-cases/ListApartmentsUseCase";
import { UpdateApartmentUseCase } from "../../application/use-cases/UpdateApartmentUseCase";
import { ImportApartmentsUseCase } from "../../application/use-cases/ImportApartmentsUseCase";
import { ApiResponse } from "../../../../shared/utils/apiResponse";


export class ApartmentController {
  constructor(
    private readonly createApartmentUseCase: CreateApartmentUseCase,
    private readonly getApartmentUseCase: GetApartmentUseCase,
    private readonly listApartmentsUseCase: ListApartmentsUseCase,
    private readonly updateApartmentUseCase: UpdateApartmentUseCase,
    private readonly importApartmentsUseCase: ImportApartmentsUseCase,
  ) { }

  createApartment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const apartment = await this.createApartmentUseCase.execute(req.body);

      res.status(201).json(
        ApiResponse.success({
          message: "Apartment created successfully",
          data: apartment.toResponseObject(),
        })
      );
    } catch (error) {
      next(error);
    }
  };

  getApartment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const apartment = await this.getApartmentUseCase.execute(Number(req.params.id));
      res.status(200).json(
        ApiResponse.success({
          message: "Apartment fetched successfully",
          data: {
            ...apartment.toResponseObject(),
            isOccupied: (apartment as any).isOccupied ?? false,
            resident: (apartment as any).resident ?? null,
          },
        })
      );
    } catch (error) {
      next(error);
    }
  };

  listApartments = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { list, stats } = await this.listApartmentsUseCase.execute({
        pageNumber: Number(req.query.pageNumber) || 1,
        pageSize: Number(req.query.pageSize) || 10,
        block: req.query.block as string | undefined,
        floorNumber: req.query.floorNumber
          ? Number(req.query.floorNumber)
          : undefined,
        type: req.query.type as string | undefined,
        isOccupied: req.query.isOccupied !== undefined
          ? req.query.isOccupied === "true"
          : undefined,
      });

      res.status(200).json(
        ApiResponse.success({
          message: "Apartments fetched successfully",
          data: {
            ...list,
            items: list.items.map(({ apartment, isOccupied }) => ({
              ...apartment.toResponseObject(),
              isOccupied,
            })),
            stats: {
              totalOccupied: stats.totalOccupied,
              totalVacant: stats.totalVacant,
              totalCount: stats.totalOccupied + stats.totalVacant,
              occupancyRate: stats.totalOccupied + stats.totalVacant > 0
                ? Math.round((stats.totalOccupied / (stats.totalOccupied + stats.totalVacant)) * 100)
                : 0,
            },
          },
        })
      );
    } catch (error) {
      next(error);
    }
  };

  updateApartment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const apartment = await this.updateApartmentUseCase.execute(
        Number(req.params.id),
        req.body
      );

      res.status(200).json(
        ApiResponse.success({
          message: "Apartment updated successfully",
          data: apartment.toResponseObject(),
        })
      );
    } catch (error) {
      next(error);
    }
  };

  importApartments = async (
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

      const result = await this.importApartmentsUseCase.execute(req.file.buffer);

      res.status(201).json(
        ApiResponse.success({
          message: `Successfully imported ${result.successCount} apartments.`,
          data: result,
        })
      );
    } catch (error) {
      next(error);
    }
  };
}