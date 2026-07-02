import type { Request, Response, NextFunction } from "express";
import { CreateFamilyMemberUseCase } from "../../application/use-cases/CreateFamilyMemberUseCase";
import { GetFamilyMembersUseCase } from "../../application/use-cases/GetFamilyMembersUseCase";
import { UpdateFamilyMemberUseCase } from "../../application/use-cases/UpdateFamilyMemberUseCase";
import { DeleteFamilyMemberUseCase } from "../../application/use-cases/DeleteFamilyMemberUseCase";
import { ApiResponse } from "../../../../shared/utils/apiResponse";
import { AuthenticatedRequest } from "../../../../shared/types/AuthenticatedRequest";

export class FamilyMemberController {
  constructor(
    private readonly createFamilyMemberUseCase: CreateFamilyMemberUseCase,
    private readonly getFamilyMembersUseCase: GetFamilyMembersUseCase,
    private readonly updateFamilyMemberUseCase: UpdateFamilyMemberUseCase,
    private readonly deleteFamilyMemberUseCase: DeleteFamilyMemberUseCase,
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
        ApiResponse.success({
          message: "Family member added successfully",
          data: familyMember.toResponseObject(),
        })
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
      const residentId = Number(req.params.residentId);

      const familyMembers = await this.getFamilyMembersUseCase.execute(residentId);

      res.status(200).json(
        ApiResponse.success({
          message: "Family members fetched successfully",
          data: familyMembers.map((fm) => fm.toResponseObject()),
        })
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
        ApiResponse.success({
          message: "Family member updated successfully",
          data: familyMember.toResponseObject(),
        })
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
        ApiResponse.success({
          message: "Family member deleted successfully",
          data: null,
        })
      );
    } catch (error) {
      next(error);
    }
  };
}