import type { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../../../../shared/utils/apiResponse";
import { AuthenticatedRequest } from "../../../../shared/types/AuthenticatedRequest";
import { UserRole } from "../../../auth/domain/entities/User";
import { IResidentRepository } from "../../../residents/domain/repositories/IResidentRepository";
import { CloudinaryService } from "../../../../shared/services/CloudinaryService";

import { CreateAmenityUseCase } from "../../application/use-cases/CreateAmenityUseCase";
import { ListAmenitiesUseCase } from "../../application/use-cases/ListAmenitiesUseCase";
import { GetAmenityUseCase } from "../../application/use-cases/GetAmenityUseCase";
import { UpdateAmenityUseCase } from "../../application/use-cases/UpdateAmenityUseCase";
import { DeactivateAmenityUseCase } from "../../application/use-cases/DeactivateAmenityUseCase";
import { GetAmenityAvailabilityUseCase } from "../../application/use-cases/GetAmenityAvailabilityUseCase";
import { CreateBlackoutUseCase } from "../../application/use-cases/CreateBlackoutUseCase";
import { ListBlackoutsUseCase } from "../../application/use-cases/ListBlackoutsUseCase";
import { DeleteBlackoutUseCase } from "../../application/use-cases/DeleteBlackoutUseCase";

export class AmenityController {
  constructor(
    private readonly createAmenityUseCase: CreateAmenityUseCase,
    private readonly listAmenitiesUseCase: ListAmenitiesUseCase,
    private readonly getAmenityUseCase: GetAmenityUseCase,
    private readonly updateAmenityUseCase: UpdateAmenityUseCase,
    private readonly deactivateAmenityUseCase: DeactivateAmenityUseCase,
    private readonly getAmenityAvailabilityUseCase: GetAmenityAvailabilityUseCase,
    private readonly createBlackoutUseCase: CreateBlackoutUseCase,
    private readonly listBlackoutsUseCase: ListBlackoutsUseCase,
    private readonly deleteBlackoutUseCase: DeleteBlackoutUseCase,
    private readonly residentRepository: IResidentRepository,
    private readonly cloudinaryService: CloudinaryService
  ) { }

  private parseExistingImages(raw: unknown): string[] {
    if (!raw) return [];
    if (Array.isArray(raw)) {
      return raw.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
    }
    if (typeof raw === "string") {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
        }
      } catch {
        // Not a JSON array, treat as single URL string
      }
      return raw.trim() ? [raw.trim()] : [];
    }
    return [];
  }

  createAmenity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const files = (req.files as Express.Multer.File[]) || [];
      const uploadedUrls = files.length > 0
        ? await this.cloudinaryService.uploadImages(files, "amenities")
        : [];

      const existingImages = [
        ...this.parseExistingImages(req.body.existingImages),
        ...this.parseExistingImages(req.body.images),
      ];

      // Remove duplicates and limit to 5
      const allImages = Array.from(new Set([...existingImages, ...uploadedUrls])).slice(0, 5);

      const capacity = req.body.capacity !== undefined && req.body.capacity !== "" && req.body.capacity !== null
        ? Number(req.body.capacity)
        : null;
      const price = req.body.price !== undefined && req.body.price !== "" && req.body.price !== null
        ? Number(req.body.price)
        : 0;
      const isActive = req.body.isActive === undefined ? true : req.body.isActive === true || req.body.isActive === "true";

      const amenity = await this.createAmenityUseCase.execute({
        name: req.body.name,
        description: req.body.description || null,
        capacity,
        operatingStart: req.body.operatingStart,
        operatingEnd: req.body.operatingEnd,
        price,
        images: allImages,
        isActive,
      });

      res.status(201).json(
        ApiResponse.success(amenity.toResponseObject(), "Amenity created successfully")
      );
    } catch (error) {
      next(error);
    }
  };

  listAmenities = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const activeOnly = authReq.user.role !== UserRole.ADMIN;
      const amenities = await this.listAmenitiesUseCase.execute(activeOnly);
      res.status(200).json(
        ApiResponse.success(
          amenities.map((a) => a.toResponseObject()),
          "Amenities fetched successfully"
        )
      );
    } catch (error) {
      next(error);
    }
  };

  getAmenity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const amenity = await this.getAmenityUseCase.execute(Number(req.params.id));
      res.status(200).json(
        ApiResponse.success(amenity.toResponseObject(), "Amenity fetched successfully")
      );
    } catch (error) {
      next(error);
    }
  };

  updateAmenity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const files = (req.files as Express.Multer.File[]) || [];
      const uploadedUrls = files.length > 0
        ? await this.cloudinaryService.uploadImages(files, "amenities")
        : [];

      const hasImagesInBody = req.body.existingImages !== undefined || req.body.images !== undefined;

      let allImages: string[] | undefined = undefined;
      if (hasImagesInBody || files.length > 0) {
        const existingImages = [
          ...this.parseExistingImages(req.body.existingImages),
          ...this.parseExistingImages(req.body.images),
        ];
        allImages = Array.from(new Set([...existingImages, ...uploadedUrls])).slice(0, 5);
      }

      const capacity = req.body.capacity !== undefined
        ? (req.body.capacity === "" || req.body.capacity === null ? null : Number(req.body.capacity))
        : undefined;
      const price = req.body.price !== undefined
        ? (req.body.price === "" || req.body.price === null ? 0 : Number(req.body.price))
        : undefined;
      const isActive = req.body.isActive !== undefined
        ? (req.body.isActive === true || req.body.isActive === "true")
        : undefined;

      const amenity = await this.updateAmenityUseCase.execute(Number(req.params.id), {
        name: req.body.name,
        description: req.body.description,
        capacity,
        operatingStart: req.body.operatingStart,
        operatingEnd: req.body.operatingEnd,
        price,
        images: allImages,
        isActive,
      });

      res.status(200).json(
        ApiResponse.success(amenity.toResponseObject(), "Amenity updated successfully")
      );
    } catch (error) {
      next(error);
    }
  };

  deactivateAmenity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const amenity = await this.deactivateAmenityUseCase.execute(Number(req.params.id));
      res.status(200).json(
        ApiResponse.success(amenity.toResponseObject(), "Amenity deactivated successfully")
      );
    } catch (error) {
      next(error);
    }
  };

  getAvailability = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.getAmenityAvailabilityUseCase.execute(
        Number(req.params.id),
        String(req.query.date)
      );
      res.status(200).json(
        ApiResponse.success(result, "Availability fetched successfully")
      );
    } catch (error) {
      next(error);
    }
  };

  createBlackout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const blackout = await this.createBlackoutUseCase.execute({
        ...req.body,
        amenityId: Number(req.params.id),
        createdByAdminId: authReq.user.userId,
      });
      res.status(201).json(
        ApiResponse.success(blackout.toResponseObject(), "Blackout created successfully")
      );
    } catch (error) {
      next(error);
    }
  };

  listBlackouts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const blackouts = await this.listBlackoutsUseCase.execute(Number(req.params.id));
      res.status(200).json(
        ApiResponse.success(
          blackouts.map((b) => b.toResponseObject()),
          "Blackouts fetched successfully"
        )
      );
    } catch (error) {
      next(error);
    }
  };

  deleteBlackout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.deleteBlackoutUseCase.execute(Number(req.params.bid));
      res.status(200).json(ApiResponse.success(null, "Blackout deleted successfully"));
    } catch (error) {
      next(error);
    }
  };
}
