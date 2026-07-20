import crypto from "crypto";
import { TenantRequest } from "../../domain/entities/TenantRequest";
import { ITenantRequestRepository } from "../../domain/repositories/ITenantRequestRepository";
import { ITenantRequestVoteRepository } from "../../domain/repositories/ITenantRequestVoteRepository";
import { IUserRepository } from "../../../auth/domain/repositories/IUserRepository";
import { IPasswordResetTokenRepository } from "../../../auth/domain/repositories/IPasswordResetTokenRepository";
import { IEmailService } from "../../../auth/domain/services/IEmailService";
import { User, UserRole } from "../../../auth/domain/entities/User";
import { PasswordResetToken } from "../../../auth/domain/entities/PasswordResetToken";
import { IPasswordHasher } from "../../../auth/domain/services/IPasswordHasher";
import { FinalizeTenantRequestDto } from "../dtos/FinalizeTenantRequestDto";
import {
  TenantRequestNotFoundError,
  TenantRequestAlreadyDecidedError,
  VotingNotCompleteError,
} from "../../domain/errors/TenantRequestErrors";
import { env } from "../../../../shared/config/env";
import { Resident } from "../../../residents/domain/entities/Resident";
import { IResidentRepository } from "../../../residents/domain/repositories/IResidentRepository";
import { notificationService } from "../../../notifications/container";

export interface FinalizeResult {
  request: TenantRequest;
  approved: boolean;
  newResident?: Resident;
}

export class FinalizeTenantRequestUseCase {
  constructor(
    private readonly tenantRequestRepository: ITenantRequestRepository,
    private readonly tenantRequestVoteRepository: ITenantRequestVoteRepository,
    private readonly residentRepository: IResidentRepository,
    private readonly userRepository: IUserRepository,
    private readonly passwordResetTokenRepository: IPasswordResetTokenRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly emailService: IEmailService,
  ) { }

  async execute(dto: FinalizeTenantRequestDto): Promise<FinalizeResult> {
    const request = await this.tenantRequestRepository.findById(dto.tenantRequestId);
    if (!request) {
      throw new TenantRequestNotFoundError(dto.tenantRequestId);
    }

    if (!request.isPending()) {
      throw new TenantRequestAlreadyDecidedError();
    }

    const owner = await this.residentRepository.findById(request.requestedBy);

    const [tally, committeeMembers, adminTally] = await Promise.all([
      this.tenantRequestVoteRepository.countByRequestId(dto.tenantRequestId),
      this.residentRepository.findCommitteeMembers(),
      this.tenantRequestVoteRepository.countAdminVotes(dto.tenantRequestId),
    ]);

    const totalCommitteeSize = committeeMembers.length;
    const adminVotes = adminTally.total;

    if (totalCommitteeSize === 0 && adminVotes === 0) {
      throw new VotingNotCompleteError();
    }

    // Total expected votes = committee members + admin (if admin voted)
    const expectedVotes = totalCommitteeSize + (adminTally.total > 0 ? 1 : 0);
    const totalVotes = tally.total + adminVotes;

    if (totalVotes < expectedVotes) {
      throw new VotingNotCompleteError();
    }

    const combinedApprove = tally.approve + adminTally.approve;
    const combinedReject = tally.reject + adminTally.reject;
    const majorityApproved = combinedApprove > combinedReject;

    if (!majorityApproved) {
      request.reject();
      const updated = await this.tenantRequestRepository.update(request);

      if (owner) {
        await this.notifyOwner(
          owner.userId,
          request.id!,
          "tenant_request_rejected",
          "Tenant Request Rejected",
          "Your tenant request was rejected by the committee."
        );
      }

      return { request: updated, approved: false };
    }

    request.approve();
    const updatedRequest = await this.tenantRequestRepository.update(request);

    const passwordHash = await this.passwordHasher.hash(
      crypto.randomBytes(32).toString("hex")
    );

    // Reuse a dormant (previously revoked) User with the same email when one
    // exists, otherwise create a brand-new account. Either way the tenant
    // must reset their password before accessing anything.
    const existingUser = await this.userRepository.findByEmail(request.tenantEmail);
    let savedTenantUser: User;
    if (existingUser) {
      existingUser.updatePassword(passwordHash);
      existingUser.reactivate();
      existingUser.requirePasswordReset();
      savedTenantUser = await this.userRepository.update(existingUser);
    } else {
      const tenantUser = User.create({
        name: request.tenantName,
        email: request.tenantEmail,
        phone: request.tenantPhone,
        passwordHash,
        role: UserRole.RESIDENT,
      });
      tenantUser.requirePasswordReset();
      savedTenantUser = await this.userRepository.create(tenantUser);
    }

    // Likewise reuse the Resident row tied to that user when present.
    const existingResident = await this.residentRepository.findByUserId(savedTenantUser.id!);
    let savedTenantResident: Resident;
    if (existingResident) {
      existingResident.reactivate();
      existingResident.updateMoveInDate(request.moveInDate);
      existingResident.updateApartment(request.apartmentId);
      existingResident.updateIsOwner(false);
      existingResident.updateMoveOutDate(null);
      if (request.moveInDate <= new Date()) {
        existingResident.markAsOccupant();
      } else {
        existingResident.markAsNonOccupant();
      }
      savedTenantResident = await this.residentRepository.update(existingResident);
    } else {
      const tenantResident = Resident.create({
        userId: savedTenantUser.id!,
        apartmentId: request.apartmentId,
        isOwner: false,
        moveInDate: request.moveInDate,
      });
      savedTenantResident = await this.residentRepository.create(tenantResident);
    }

    // The tenant now occupies the unit. When the move-in date has already
    // arrived, the tenant becomes the occupant and any other active occupant
    // in the same apartment (typically the owner) must yield occupancy.
    // We do this explicitly here so it no longer depends on the overnight
    // cron job, which only demotes occupants as a side-effect of promoting
    // a previously non-occupant resident.
    if (request.moveInDate <= new Date() && savedTenantResident.id != null) {
      await this.residentRepository.clearApartmentOccupants(
        request.apartmentId,
        savedTenantResident.id
      );
    }

    if (owner) {
      await this.notifyOwner(
        owner.userId,
        request.id!,
        "tenant_request_approved",
        "Tenant Request Approved",
        "Your tenant request was approved. The tenant can now set up their account."
      );
    }

    await this.passwordResetTokenRepository.deleteByUserId(savedTenantUser.id!);
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenEntity = PasswordResetToken.create(savedTenantUser.id!, rawToken);
    await this.passwordResetTokenRepository.create(tokenEntity);

    const setPasswordLink = `${env.CLIENT_URL}/reset-password?token=${rawToken}`;

    const moveInDateLabel = new Date(request.moveInDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    await this.emailService.sendEmail({
      to: savedTenantUser.email,
      subject: "Welcome — Set up your Civic Horizon account",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #111827;">Welcome to Civic Horizon</h2>
          <p style="color: #6b7280;">
            Your tenant request has been approved. To get started, set up your
            password using the button below. This link expires in <strong>10 minutes</strong>.
          </p>
          <p style="color: #6b7280;">
            You can access all features of Civic Horizon from
            <strong>${moveInDateLabel}</strong>.
          </p>
          <a href="${setPasswordLink}"
            style="display: inline-block; background: #111827; color: #fff;
                   padding: 12px 24px; border-radius: 8px; text-decoration: none;
                   font-weight: 600; margin: 16px 0;">
            Set Your Password
          </a>
          <p style="color: #9ca3af; font-size: 0.85rem;">
            Or copy this link: <a href="${setPasswordLink}">${setPasswordLink}</a>
          </p>
        </div>
      `,
    });

    return {
      request: updatedRequest,
      approved: true,
      newResident: savedTenantResident,
    };
  }

  private async notifyOwner(
    userId: number,
    tenantRequestId: number,
    type: "tenant_request_approved" | "tenant_request_rejected",
    title: string,
    body: string
  ): Promise<void> {
    try {
      await notificationService.notify(userId, type, title, body, {
        tenantRequestId,
      });
    } catch (error) {
      console.error("Failed to send tenant request notification", error);
    }
  }
}