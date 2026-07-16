import { VoteChoice } from "../../domain/entities/TenantRequestVote";

export interface RecordVoteDto {
  tenantRequestId: number;
  committeeMemberId: number;
  vote: VoteChoice;
  recordedByAdminId: number;
}