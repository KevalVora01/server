import { DocumentRequestVote, VoteChoice } from "../../domain/entities/DocumentRequestVote";
import { IDocumentRequestVoteRepository } from "../../domain/repositories/IDocumentRequestVoteRepository";
import { IDocumentRequestRepository } from "../../domain/repositories/IDocumentRequestRepository";
import { BulkRecordDocumentVotesDto } from "../dto/BulkRecordDocumentVotesDto";
import { DocumentRequestNotFoundError, DocumentRequestVotingError, DocumentRequestAlreadyFinalizedError } from "../../domain/errors/DocumentRequestErrors";
import { DocumentRequestStatus } from "../../domain/entities/DocumentRequest";

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

    if ((!dto.votes || dto.votes.length === 0) && !dto.adminVote) {
      throw new DocumentRequestVotingError("At least one vote must be provided.");
    }

    const voteEntities: DocumentRequestVote[] = [];

    if (dto.votes) {
      const uniqueMembers = new Set(dto.votes.map((v) => v.committeeMemberId));
      if (uniqueMembers.size !== dto.votes.length) {
        throw new DocumentRequestVotingError("Duplicate committee member votes are not allowed.");
      }

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
