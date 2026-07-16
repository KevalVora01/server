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

export class RecordVoteUseCase {
  constructor(
    private readonly tenantRequestRepository: ITenantRequestRepository,
    private readonly tenantRequestVoteRepository: ITenantRequestVoteRepository,
    private readonly residentRepository: IResidentRepository,
  ) { }

  async execute(dto: RecordVoteDto): Promise<TenantRequestVote> {
    const request = await this.tenantRequestRepository.findById(dto.tenantRequestId);
    if (!request) {
      throw new TenantRequestNotFoundError(dto.tenantRequestId);
    }

    if (!request.isPending()) {
      throw new TenantRequestAlreadyDecidedError();
    }

    const committeeMember = await this.residentRepository.findById(dto.committeeMemberId);
    if (!committeeMember || !committeeMember.isCommitteeMember) {
      throw new NotACommitteeMemberError();
    }

    const existingVote = await this.tenantRequestVoteRepository.findByRequestAndMember(
      dto.tenantRequestId,
      dto.committeeMemberId
    );
    if (existingVote) {
      throw new DuplicateVoteError();
    }

    const vote = TenantRequestVote.create({
      tenantRequestId: dto.tenantRequestId,
      committeeMemberId: dto.committeeMemberId,
      vote: dto.vote,
      recordedByAdminId: dto.recordedByAdminId,
    });

    return this.tenantRequestVoteRepository.create(vote);
  }
}