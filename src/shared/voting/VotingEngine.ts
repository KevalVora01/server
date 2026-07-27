import { VoteChoice, IVoteEntry, IVotingOutcome, IVoteBatchInput } from "./types";

export class VotingEngine {
  /**
   * Evaluates the outcome of a list of vote entries.
   * Total approve and reject counts include committee member votes and admin vote.
   * If total approve > total reject => Approved.
   * If total reject > total approve => Rejected.
   * If total approve === total reject (tied) => Admin vote is final result.
   */
  static evaluateOutcome(votes: IVoteEntry[]): IVotingOutcome {
    const adminVote = votes.find((v) => v.committeeMemberId == null);

    const approveCount = votes.filter((v) => v.vote === VoteChoice.APPROVE).length;
    const rejectCount = votes.filter((v) => v.vote === VoteChoice.REJECT).length;

    if (approveCount > rejectCount) {
      return {
        isApproved: true,
        reason: "Approved by majority vote.",
        approveCount,
        rejectCount,
        isTie: false,
        adminVoteUsedAsTiebreaker: false,
      };
    }

    if (rejectCount > approveCount) {
      return {
        isApproved: false,
        reason: "Rejected by majority vote.",
        approveCount,
        rejectCount,
        isTie: false,
        adminVoteUsedAsTiebreaker: false,
      };
    }

    // Tied case (approveCount === rejectCount)
    if (adminVote) {
      const isApproved = adminVote.vote === VoteChoice.APPROVE;
      return {
        isApproved,
        reason: isApproved
          ? "Approved by admin tiebreaker vote."
          : "Rejected by admin vote (tiebreaker).",
        approveCount,
        rejectCount,
        isTie: true,
        adminVoteUsedAsTiebreaker: true,
      };
    }

    return {
      isApproved: false,
      reason: "Rejected — tie could not be resolved.",
      approveCount,
      rejectCount,
      isTie: true,
      adminVoteUsedAsTiebreaker: false,
    };
  }

  /**
   * Evaluates outcome from vote tallies (committee counts + admin counts).
   */
  static evaluateOutcomeFromCounts(tally: {
    committeeApprove: number;
    committeeReject: number;
    adminApprove: number;
    adminReject: number;
  }): IVotingOutcome {
    const approveCount = tally.committeeApprove + tally.adminApprove;
    const rejectCount = tally.committeeReject + tally.adminReject;
    const hasAdminVote = tally.adminApprove > 0 || tally.adminReject > 0;

    if (approveCount > rejectCount) {
      return {
        isApproved: true,
        reason: "Approved by majority vote.",
        approveCount,
        rejectCount,
        isTie: false,
        adminVoteUsedAsTiebreaker: false,
      };
    }

    if (rejectCount > approveCount) {
      return {
        isApproved: false,
        reason: "Rejected by majority vote.",
        approveCount,
        rejectCount,
        isTie: false,
        adminVoteUsedAsTiebreaker: false,
      };
    }

    // Tied case
    if (hasAdminVote) {
      const isApproved = tally.adminApprove > 0;
      return {
        isApproved,
        reason: isApproved
          ? "Approved by admin tiebreaker vote."
          : "Rejected by admin vote (tiebreaker).",
        approveCount,
        rejectCount,
        isTie: true,
        adminVoteUsedAsTiebreaker: true,
      };
    }

    return {
      isApproved: false,
      reason: "Rejected — tie could not be resolved.",
      approveCount,
      rejectCount,
      isTie: true,
      adminVoteUsedAsTiebreaker: false,
    };
  }

  /**
   * Validates vote batch inputs before persisting.
   * Ensures at least one vote is provided and no duplicate committee members exist.
   */
  static validateVoteBatch(dto: IVoteBatchInput): void {
    const hasCommitteeVotes = dto.votes && dto.votes.length > 0;
    const hasAdminVote = !!dto.adminVote;

    if (!hasCommitteeVotes && !hasAdminVote) {
      throw new Error("At least one vote must be provided.");
    }

    if (dto.votes) {
      const uniqueMembers = new Set(dto.votes.map((v) => v.committeeMemberId));
      if (uniqueMembers.size !== dto.votes.length) {
        throw new Error("Duplicate committee member votes are not allowed.");
      }
    }
  }
}
