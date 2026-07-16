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

    const [tally, committeeMembers] = await Promise.all([
      this.tenantRequestVoteRepository.countByRequestId(dto.tenantRequestId),
      this.residentRepository.findCommitteeMembers(),
    ]);

    const totalCommitteeSize = committeeMembers.length;

    if (totalCommitteeSize === 0) {
      throw new VotingNotCompleteError();
    }

    if (tally.total < totalCommitteeSize) {
      throw new VotingNotCompleteError();
    }

    const majorityApproved = tally.approve > totalCommitteeSize / 2;

    if (!majorityApproved) {
      request.reject();
      const updated = await this.tenantRequestRepository.update(request);
      return { request: updated, approved: false };
    }

    request.approve();
    const updatedRequest = await this.tenantRequestRepository.update(request);

    const randomInitialPassword = crypto.randomBytes(32).toString("hex");
    const passwordHash = await this.passwordHasher.hash(randomInitialPassword);

    const tenantUser = User.create({
      name: request.tenantName,
      email: request.tenantEmail,
      phone: request.tenantPhone,
      passwordHash,
      role: UserRole.RESIDENT,
    });
    const savedTenantUser = await this.userRepository.create(tenantUser);

    const tenantResident = Resident.create({
      userId: savedTenantUser.id!,
      apartmentId: request.apartmentId,
      isOwner: false,
      moveInDate: request.moveInDate,
    });
    const savedTenantResident = await this.residentRepository.create(tenantResident);

    const owner = await this.residentRepository.findById(request.requestedBy);
    if (owner) {
      owner.markAsNonOccupant();
      await this.residentRepository.update(owner);
    }

    await this.passwordResetTokenRepository.deleteByUserId(savedTenantUser.id!);
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenEntity = PasswordResetToken.create(savedTenantUser.id!, rawToken);
    await this.passwordResetTokenRepository.create(tokenEntity);

    const setPasswordLink = `${env.CLIENT_URL}/reset-password?token=${rawToken}`;

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
}