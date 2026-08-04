import { DocumentRequestVote, VoteChoice } from "../../domain/entities/DocumentRequestVote";
import { IDocumentRequestVoteRepository } from "../../domain/repositories/IDocumentRequestVoteRepository";
import { IDocumentRequestRepository } from "../../domain/repositories/IDocumentRequestRepository";
import { BulkRecordDocumentVotesDto } from "../dtos/BulkRecordDocumentVotesDto";
import { DocumentRequestNotFoundError, DocumentRequestVotingError, DocumentRequestAlreadyFinalizedError } from "../../domain/errors/DocumentRequestErrors";
import { DocumentRequestStatus } from "../../domain/entities/DocumentRequest";

import { VotingEngine } from "../../../../shared/voting";

export class BulkRecordDocumentVotesUseCase {
  constructor(
    private readonly documentRequestRepository: IDocumentRequestRepository,
    private readonly documentRequestVoteRepository: IDocumentRequestVoteRepository,
  ) {}

  async execute(documentRequestId: number, dto: BulkRecordDocumentVotesDto, adminUserId: number): Promise<DocumentRequestVote[]> {
    const request = await this.documentRequestRepository.findById(documentRequestId);
    if (!request) {
      throw new DocumentRequestNotFoundError(documentRequestId);
    }

    if (request.status !== DocumentRequestStatus.PENDING) {
      throw new DocumentRequestAlreadyFinalizedError();
    }

    try {
      VotingEngine.validateVoteBatch({
        votes: dto.votes as unknown as Parameters<typeof VotingEngine.validateVoteBatch>[0]['votes'],
        adminVote: dto.adminVote as unknown as Parameters<typeof VotingEngine.validateVoteBatch>[0]['adminVote'],
      });
    } catch (err) {
      const error = err as Error;
      throw new DocumentRequestVotingError(error.message);
    }

    const voteEntities: DocumentRequestVote[] = [];

    if (dto.votes) {
      dto.votes.forEach((v) => {
        voteEntities.push(
          DocumentRequestVote.create({
            documentRequestId,
            committeeMemberId: v.committeeMemberId,
            vote: v.vote as VoteChoice,
            recordedByAdminId: adminUserId,
          }),
        );
      });
    }

    if (dto.adminVote) {
      voteEntities.push(
        DocumentRequestVote.create({
          documentRequestId,
          vote: dto.adminVote as VoteChoice,
          recordedByAdminId: adminUserId,
        }),
      );
    }

    await this.documentRequestVoteRepository.deleteByDocumentRequestId(documentRequestId);

    return this.documentRequestVoteRepository.bulkCreate(voteEntities);
  }
}
