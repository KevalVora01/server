import { TenantRequestVote } from "../../domain/entities/TenantRequestVote";
import { ITenantRequestRepository } from "../../domain/repositories/ITenantRequestRepository";
import { ITenantRequestVoteRepository } from "../../domain/repositories/ITenantRequestVoteRepository";
import { RecordVoteDto } from "../dtos/RecordVoteDto";
import {
  TenantRequestNotFoundError,
  TenantRequestAlreadyDecidedError,
  DuplicateVoteError,
  NotACommitteeMemberError,
} from "../../domain/errors/TenantRequestErrors";
import { IResidentRepository } from "../../../residents/domain/repositories/IResidentRepository";
import { IUserRepository } from "../../../auth/domain/repositories/IUserRepository";
import { UserRole } from "../../../auth/domain/entities/User";
import { UniqueConstraintError } from "sequelize";

export class RecordVoteUseCase {
  constructor(
    private readonly tenantRequestRepository: ITenantRequestRepository,
    private readonly tenantRequestVoteRepository: ITenantRequestVoteRepository,
    private readonly residentRepository: IResidentRepository,
    private readonly userRepository: IUserRepository,
  ) { }

  async execute(dto: RecordVoteDto): Promise<TenantRequestVote> {
    const request = await this.tenantRequestRepository.findById(dto.tenantRequestId);
    if (!request) {
      throw new TenantRequestNotFoundError(dto.tenantRequestId);
    }

    if (!request.isPending()) {
      throw new TenantRequestAlreadyDecidedError();
    }

    // Case 1: Admin voting on behalf of a committee member (BOTH provided)
    if (dto.committeeMemberId && dto.recordedByAdminId) {
      const admin = await this.userRepository.findById(dto.recordedByAdminId);
      if (!admin || admin.role !== UserRole.ADMIN) {
        throw new NotACommitteeMemberError();
      }

      const committeeMember = await this.residentRepository.findById(dto.committeeMemberId);
      if (!committeeMember || !committeeMember.isCommitteeMember) {
        throw new NotACommitteeMemberError();
      }

      // Check if this committee member has already voted
      const existingMemberVote = await this.tenantRequestVoteRepository.findByRequestAndMember(
        dto.tenantRequestId,
        dto.committeeMemberId
      );
      if (existingMemberVote) {
        existingMemberVote.changeVote(dto.vote);
        existingMemberVote.recordByAdmin(dto.recordedByAdminId);
        return await this.tenantRequestVoteRepository.update(existingMemberVote);
      }

      const vote = TenantRequestVote.create({
        tenantRequestId: dto.tenantRequestId,
        committeeMemberId: dto.committeeMemberId,
        vote: dto.vote,
        recordedByAdminId: dto.recordedByAdminId,
      });

      try {
        return await this.tenantRequestVoteRepository.create(vote);
      } catch (err) {
        if (err instanceof UniqueConstraintError) {
          throw new DuplicateVoteError();
        }
        throw err;
      }
    }

    // Case 2: Admin voting directly (only recordedByAdminId)
    if (dto.recordedByAdminId) {
      const admin = await this.userRepository.findById(dto.recordedByAdminId);
      if (!admin || admin.role !== UserRole.ADMIN) {
        throw new NotACommitteeMemberError();
      }

      const existingAdminVote = await this.tenantRequestVoteRepository.findByRequestAndAdmin(
        dto.tenantRequestId,
        dto.recordedByAdminId
      );
      if (existingAdminVote) {
        existingAdminVote.changeVote(dto.vote);
        return await this.tenantRequestVoteRepository.update(existingAdminVote);
      }

      const vote = TenantRequestVote.create({
        tenantRequestId: dto.tenantRequestId,
        committeeMemberId: undefined,
        vote: dto.vote,
        recordedByAdminId: dto.recordedByAdminId,
      });

      try {
        return await this.tenantRequestVoteRepository.create(vote);
      } catch (err) {
        if (err instanceof UniqueConstraintError) {
          throw new DuplicateVoteError();
        }
        throw err;
      }
    }

    // Case 3: Committee member voting on their own behalf (only committeeMemberId)
    if (dto.committeeMemberId) {
      const committeeMember = await this.residentRepository.findById(dto.committeeMemberId);
      if (!committeeMember || !committeeMember.isCommitteeMember) {
        throw new NotACommitteeMemberError();
      }

      const existingVote = await this.tenantRequestVoteRepository.findByRequestAndMember(
        dto.tenantRequestId,
        dto.committeeMemberId
      );
      if (existingVote) {
        existingVote.changeVote(dto.vote);
        return await this.tenantRequestVoteRepository.update(existingVote);
      }

      const vote = TenantRequestVote.create({
        tenantRequestId: dto.tenantRequestId,
        committeeMemberId: dto.committeeMemberId,
        vote: dto.vote,
        recordedByAdminId: undefined,
      });

      try {
        return await this.tenantRequestVoteRepository.create(vote);
      } catch (err) {
        if (err instanceof UniqueConstraintError) {
          throw new DuplicateVoteError();
        }
        throw err;
      }
    }

    throw new Error("Either committeeMemberId or recordedByAdminId must be provided");
  }
}