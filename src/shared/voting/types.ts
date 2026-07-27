export enum VoteChoice {
  APPROVE = "Approve",
  REJECT = "Reject",
}

export interface IVoteEntry {
  committeeMemberId?: number | null;
  vote: VoteChoice;
  recordedByAdminId?: number | null;
}

export interface IVotingOutcome {
  isApproved: boolean;
  reason: string;
  approveCount: number;
  rejectCount: number;
  isTie: boolean;
  adminVoteUsedAsTiebreaker: boolean;
}

export interface IVoteBatchInput {
  votes?: Array<{ committeeMemberId: number; vote: VoteChoice }>;
  adminVote?: VoteChoice;
}
