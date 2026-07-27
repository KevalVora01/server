import { VoteChoice } from "../../domain/entities/TenantRequestVote";

export interface BulkVoteEntry {
  committeeMemberId: number;
  vote: VoteChoice;
}

export interface BulkRecordVotesDto {
  tenantRequestId: number;
  recordedByAdminId: number;
  adminVote?: VoteChoice;
  votes: BulkVoteEntry[];
}
