import { DocumentRequest, DocumentRequestStatus } from "../../domain/entities/DocumentRequest";
import { VoteChoice } from "../../domain/entities/DocumentRequestVote";
import { IDocumentRequestRepository } from "../../domain/repositories/IDocumentRequestRepository";
import { IDocumentRequestVoteRepository } from "../../domain/repositories/IDocumentRequestVoteRepository";
import { DocumentRequestNotFoundError, DocumentRequestAlreadyFinalizedError } from "../../domain/errors/DocumentRequestErrors";

export class FinalizeDocumentRequestUseCase {
  constructor(
    private readonly documentRequestRepository: IDocumentRequestRepository,
    private readonly documentRequestVoteRepository: IDocumentRequestVoteRepository,
  ) {}

  async execute(documentRequestId: number): Promise<DocumentRequest> {
    const request = await this.documentRequestRepository.findById(documentRequestId);
    if (!request) {
      throw new DocumentRequestNotFoundError(documentRequestId);
    }

    if (request.status !== DocumentRequestStatus.PENDING) {
      throw new DocumentRequestAlreadyFinalizedError();
    }

    const votes = await this.documentRequestVoteRepository.findByDocumentRequestId(documentRequestId);
    if (votes.length === 0) {
      throw new Error("No votes recorded for this document request.");
    }

    const committeeVotes = votes.filter((v) => v.committeeMemberId != null);
    const adminVote = votes.find((v) => v.committeeMemberId == null);

    const approveCount = committeeVotes.filter((v) => v.vote === VoteChoice.APPROVE).length;
    const rejectCount = committeeVotes.filter((v) => v.vote === VoteChoice.REJECT).length;

    if (approveCount > rejectCount) {
      request.approve();
    } else if (rejectCount > approveCount) {
      request.reject("Rejected by committee vote.");
    } else if (adminVote) {
      if (adminVote.vote === VoteChoice.APPROVE) {
        request.approve();
      } else {
        request.reject("Rejected by admin vote (tiebreaker).");
      }
    } else {
      request.reject("Rejected — tie could not be resolved.");
    }

    return this.documentRequestRepository.update(request);
  }
}
