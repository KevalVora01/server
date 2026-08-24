import { VoteChoice } from "../../../../shared/voting";

export interface BookingVoteEntry {
  committeeMemberId: number;
  vote: VoteChoice;
}

export interface BulkRecordBookingVotesDto {
  votes?: BookingVoteEntry[];
  adminVote?: VoteChoice;
}
