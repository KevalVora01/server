export interface VoteEntry {
  committeeMemberId: number;
  vote: "Approve" | "Reject";
}

export interface BulkRecordDocumentVotesDto {
  votes: VoteEntry[];
  adminVote?: "Approve" | "Reject";
}
