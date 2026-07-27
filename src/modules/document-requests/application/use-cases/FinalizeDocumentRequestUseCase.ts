import { DocumentRequest, DocumentRequestStatus } from "../../domain/entities/DocumentRequest";
import { VoteChoice } from "../../domain/entities/DocumentRequestVote";
import { IDocumentRequestRepository } from "../../domain/repositories/IDocumentRequestRepository";
import { IDocumentRequestVoteRepository } from "../../domain/repositories/IDocumentRequestVoteRepository";
import { IDocumentRequestNotifier } from "../../domain/services/IDocumentRequestNotifier";
import { DocumentRequestNotFoundError, DocumentRequestAlreadyFinalizedError } from "../../domain/errors/DocumentRequestErrors";
import { VotingEngine } from "../../../../shared/voting";

export class FinalizeDocumentRequestUseCase {
  constructor(
    private readonly documentRequestRepository: IDocumentRequestRepository,
    private readonly documentRequestVoteRepository: IDocumentRequestVoteRepository,
    private readonly documentRequestNotifier?: IDocumentRequestNotifier,
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

    const oldStatus = request.status;
    const outcome = VotingEngine.evaluateOutcome(votes);

    if (outcome.isApproved) {
      request.approve();
    } else {
      request.reject(outcome.reason);
    }

    const updated = await this.documentRequestRepository.update(request);

    if (this.documentRequestNotifier) {
      await this.documentRequestNotifier.notifyStatusChanged(updated, oldStatus);
    }

    return updated;
  }
}
