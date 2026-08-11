import type { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { PasswordResetTokenModel } from "../../../auth/infrastructure/models/PasswordResetTokenModel";
import { IEmailService } from "../../../auth/domain/services/IEmailService";

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
import { Resident } from "../../domain/entities/Resident";

export class ResidentController {
  constructor(
    private readonly createResidentUseCase: CreateResidentUseCase,
    private readonly getResidentUseCase: GetResidentUseCase,
    private readonly listResidentsUseCase: ListResidentsUseCase,
    private readonly updateResidentUseCase: UpdateResidentUseCase,
    private readonly deactivateResidentUseCase: DeactivateResidentUseCase,
    private readonly listApartmentTenantsUseCase: ListApartmentTenantsUseCase,
    private readonly residentRepository: IResidentRepository,
    private readonly importResidentsUseCase: ImportResidentsUseCase,
    private readonly emailService?: IEmailService
  ) { }

  createResident = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { resident, emailItem } = await this.createResidentUseCase.execute(req.body);

      res.status(201).json(
        ApiResponse.success({
          message: "Resident created successfully",
          data: {
            ...resident.toResponseObject(),
            emailItem,
          },
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
            user: resident.user ?? null,
            apartment: resident.apartment ?? null,
          },
        })
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
      const userId = authReq.user?.userId;
      if (!userId) {
        res.status(401).json(ApiResponse.error("Unauthorized"));
        return;
      }

      const resident = await this.residentRepository.findByUserId(userId);
      if (!resident) {
        res.status(404).json(ApiResponse.error("Resident record not found"));
        return;
      }

      res.status(200).json(
        ApiResponse.success({
          message: "Resident record retrieved successfully",
          data: {
            ...resident.toResponseObject(),
            user: resident.user ?? null,
            apartment: resident.apartment ?? null,
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
      const pageNumber = req.query.pageNumber ? Number(req.query.pageNumber) : 1;
      const pageSize = req.query.pageSize ? Number(req.query.pageSize) : 10;
      const apartmentId = req.query.apartmentId ? Number(req.query.apartmentId) : undefined;
      const isOwner = req.query.isOwner !== undefined ? req.query.isOwner === "true" : undefined;
      const isActive = req.query.isActive !== undefined ? req.query.isActive === "true" : undefined;
      const search = req.query.search ? String(req.query.search) : undefined;

      const { list, stats } = await this.listResidentsUseCase.execute({
        pageNumber,
        pageSize,
        apartmentId,
        isOwner,
        isActive,
        search,
      });

      res.status(200).json(
        ApiResponse.success({
          message: "Residents list retrieved successfully",
          data: {
            items: list.items.map((resItem: Resident) => ({
              ...resItem.toResponseObject(),
              user: resItem.user ?? null,
              apartment: resItem.apartment ?? null,
            })),
            pagination: {
              totalItems: list.totalCount,
              totalPages: list.totalPages,
              currentPage: list.pageNumber,
              pageSize: list.pageSize,
            },
            stats,
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
      await this.deactivateResidentUseCase.execute(
        Number(req.params.id)
      );

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
      const apartmentId = Number(req.params.apartmentId);
      const history = await this.listApartmentTenantsUseCase.execute(apartmentId);

      res.status(200).json(
        ApiResponse.success({
          message: "Apartment tenant history retrieved successfully",
          data: history.map((item) => item.toResponseObject()),
        })
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

  sendWelcomeEmail = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { userId, email, name, unit, temporaryPassword } = req.body;

      if (!userId || !email || !name) {
        res.status(400).json(ApiResponse.error("Missing required parameters (userId, email, name)"));
        return;
      }

      // Generate Password Reset Token for direct password reset button in welcome email
      const rawToken = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await PasswordResetTokenModel.destroy({
        where: { userId },
      });

      await PasswordResetTokenModel.create({
        userId,
        token: rawToken,
        expiresAt,
      });

      const societyName = process.env.SOCIETY_NAME || "Civic Horizon";
      const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
      const resetLink = `${clientUrl}/reset-password?token=${rawToken}`;
      const unitName = unit || "Your Apartment";
      const passwordToDisplay = temporaryPassword || "••••••••";

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 30px; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
            <div style="background-color: #1a1f36; padding: 24px; text-align: center;">
              <h2 style="color: #ffffff; margin: 0; font-size: 22px;">Welcome to ${societyName}!</h2>
            </div>
            <div style="padding: 30px;">
              <p style="font-size: 16px; margin-top: 0;">Hello <strong>${name}</strong>,</p>
              <p style="font-size: 15px; color: #555;">
                An account has been created for you as a resident of unit <strong>${unitName}</strong> at ${societyName}.
              </p>
              
              <div style="background-color: #f8f9fa; border-left: 4px solid #1a1f36; padding: 16px; margin: 24px 0; border-radius: 4px;">
                <p style="margin: 0 0 8px 0; font-size: 14px; color: #666;"><strong>Your Login Credentials:</strong></p>
                <p style="margin: 0 0 6px 0; font-size: 15px;"><strong>Email:</strong> ${email}</p>
                <p style="margin: 0; font-size: 15px;"><strong>Temporary Password:</strong> <span style="font-family: monospace; background: #e9ecef; padding: 2px 6px; border-radius: 4px; font-weight: bold; color: #1a1f36;">${passwordToDisplay}</span></p>
              </div>

              <p style="font-size: 14px; color: #666;">
                You can set your own password directly by clicking the button below, or log in with your temporary password.
              </p>

              <div style="text-align: center; margin: 25px 0 10px 0;">
                <a href="${resetLink}" style="background-color: #1a1f36; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 15px;">
                  Set Your Password Directly
                </a>
              </div>
              <p style="text-align: center; font-size: 13px; color: #777; margin-top: 10px;">
                Or <a href="${clientUrl}/login" style="color: #1a1f36; text-decoration: underline;">log in to your account</a>
              </p>
            </div>
            <div style="background-color: #f1f3f5; padding: 16px; text-align: center; font-size: 12px; color: #888;">
              <p style="margin: 0;">© ${new Date().getFullYear()} ${societyName}. All rights reserved.</p>
            </div>
          </div>
        </div>
      `;

      if (this.emailService) {
        await this.emailService.sendEmail({
          to: email,
          subject: `Welcome to ${societyName} - Your Account Credentials & Reset Password`,
          html: htmlContent,
        }).catch((err) => console.error("[sendWelcomeEmail] Delivery error:", err));
      }

      res.status(200).json(
        ApiResponse.success({
          message: "Welcome email delivered successfully",
          data: { userId, email },
        })
      );
    } catch (error) {
      next(error);
    }
  };
}