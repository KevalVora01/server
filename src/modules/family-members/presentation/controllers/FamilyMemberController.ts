import type { Request, Response, NextFunction } from "express";
import { CreateFamilyMemberUseCase } from "../../application/use-cases/CreateFamilyMemberUseCase";
import { GetFamilyMembersUseCase } from "../../application/use-cases/GetFamilyMembersUseCase";
import { UpdateFamilyMemberUseCase } from "../../application/use-cases/UpdateFamilyMemberUseCase";
import { DeleteFamilyMemberUseCase } from "../../application/use-cases/DeleteFamilyMemberUseCase";
import { ListApartmentFamilyMembersUseCase } from "../../application/use-cases/ListApartmentFamilyMembersUseCase";
import { IResidentRepository } from "../../../residents/domain/repositories/IResidentRepository";
import { ApiResponse } from "../../../../shared/utils/apiResponse";
import { AuthenticatedRequest } from "../../../../shared/types/AuthenticatedRequest";
import { UserRole } from "../../../auth/domain/entities/User";

export class FamilyMemberController {
  constructor(
    private readonly createFamilyMemberUseCase: CreateFamilyMemberUseCase,
    private readonly getFamilyMembersUseCase: GetFamilyMembersUseCase,
    private readonly updateFamilyMemberUseCase: UpdateFamilyMemberUseCase,
    private readonly deleteFamilyMemberUseCase: DeleteFamilyMemberUseCase,
    private readonly listApartmentFamilyMembersUseCase: ListApartmentFamilyMembersUseCase,
    private readonly residentRepository: IResidentRepository,
  ) { }

  createFamilyMember = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const residentId = Number(req.params.residentId);

      const familyMember = await this.createFamilyMemberUseCase.execute({
        residentId,
        ...req.body,
      });

      res.status(201).json(
        ApiResponse.success(familyMember.toResponseObject(), "Family member added successfully")
      );
    } catch (error) {
      next(error);
    }
  };

  getFamilyMembers = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const residentId = Number(req.params.residentId);

      // Residents may only view their own family members via this route;
      // Admin may view any resident's.
      // Owner of the same apartment may also view tenant's family members.
      if (authReq.user.role === UserRole.RESIDENT) {
        const requester = await this.residentRepository.findByUserId(authReq.user.userId);
        const targetResident = await this.residentRepository.findById(residentId);

        if (!requester || !targetResident) {
          res.status(404).json(ApiResponse.error("Resident not found"));
          return;
        }

        const isOwn = requester.id === residentId;
        const isApartmentOwner = requester.isOwner && requester.apartmentId === targetResident.apartmentId;

        if (!isOwn && !isApartmentOwner) {
          res.status(403).json(ApiResponse.error("You can only view your own family members"));
          return;
        }
      }

      const familyMembers = await this.getFamilyMembersUseCase.execute(residentId);

      res.status(200).json(
        ApiResponse.success(familyMembers.map((fm) => fm.toResponseObject()), "Family members fetched successfully")
      );
    } catch (error) {
      next(error);
    }
  };

  listApartmentFamilyMembers = async (
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

      const familyMembers = await this.listApartmentFamilyMembersUseCase.execute(requester.id!);

      res.status(200).json(
        ApiResponse.success(familyMembers.map((fm) => fm.toResponseObject()), "Apartment family members fetched successfully")
      );
    } catch (error) {
      next(error);
    }
  };

  updateFamilyMember = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const residentId = Number(req.params.residentId);
      const id = Number(req.params.id);

      const familyMember = await this.updateFamilyMemberUseCase.execute(
        id,
        residentId,
        req.body
      );

      res.status(200).json(
        ApiResponse.success(familyMember.toResponseObject(), "Family member updated successfully")
      );
    } catch (error) {
      next(error);
    }
  };

  deleteFamilyMember = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const residentId = Number(req.params.residentId);
      const id = Number(req.params.id);

      await this.deleteFamilyMemberUseCase.execute(id, residentId);

      res.status(200).json(
        ApiResponse.success(null, "Family member deleted successfully")
      );
    } catch (error) {
      next(error);
    }
  };
}