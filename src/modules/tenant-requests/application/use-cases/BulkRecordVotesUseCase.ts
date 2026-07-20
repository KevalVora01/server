import { TenantRequestVote, VoteChoice } from "../../domain/entities/TenantRequestVote";
import { ITenantRequestRepository } from "../../domain/repositories/ITenantRequestRepository";
import { ITenantRequestVoteRepository } from "../../domain/repositories/ITenantRequestVoteRepository";
import { BulkRecordVotesDto } from "../dtos/BulkRecordVotesDto";
import {
  TenantRequestNotFoundError,
  TenantRequestAlreadyDecidedError,
  NotACommitteeMemberError,
} from "../../domain/errors/TenantRequestErrors";
import { IResidentRepository } from "../../../residents/domain/repositories/IResidentRepository";
import { IUserRepository } from "../../../auth/domain/repositories/IUserRepository";
import { UserRole } from "../../../auth/domain/entities/User";

export class BulkRecordVotesUseCase {
  constructor(
    private readonly tenantRequestRepository: ITenantRequestRepository,
    private readonly tenantRequestVoteRepository: ITenantRequestVoteRepository,
    private readonly residentRepository: IResidentRepository,
    private readonly userRepository: IUserRepository,
  ) { }

  async execute(dto: BulkRecordVotesDto): Promise<TenantRequestVote[]> {
    const request = await this.tenantRequestRepository.findById(dto.tenantRequestId);
    if (!request) {
      throw new TenantRequestNotFoundError(dto.tenantRequestId);
    }

    if (!request.isPending()) {
      throw new TenantRequestAlreadyDecidedError();
    }

    const admin = await this.userRepository.findById(dto.recordedByAdminId);
    if (!admin || admin.role !== UserRole.ADMIN) {
      throw new NotACommitteeMemberError();
    }

    const votes: TenantRequestVote[] = [];

    for (const entry of dto.votes) {
      const committeeMember = await this.residentRepository.findById(entry.committeeMemberId);
      if (!committeeMember || !committeeMember.isCommitteeMember) {
        throw new NotACommitteeMemberError();
      }

      votes.push(
        TenantRequestVote.create({
          tenantRequestId: dto.tenantRequestId,
          committeeMemberId: entry.committeeMemberId,
          vote: entry.vote,
          recordedByAdminId: dto.recordedByAdminId,
        })
      );
    }

    if (dto.adminVote) {
      votes.push(
        TenantRequestVote.create({
          tenantRequestId: dto.tenantRequestId,
          committeeMemberId: undefined,
          vote: dto.adminVote,
          recordedByAdminId: dto.recordedByAdminId,
        })
      );
    }

    return await this.tenantRequestVoteRepository.replaceAllForRequest(
      dto.tenantRequestId,
      votes,
      dto.recordedByAdminId
    );
  }
}
