import { DocumentRequestVote } from "../entities/DocumentRequestVote";

export interface IDocumentRequestVoteRepository {
  bulkCreate(votes: DocumentRequestVote[]): Promise<DocumentRequestVote[]>;
  findByDocumentRequestId(documentRequestId: number): Promise<DocumentRequestVote[]>;
  findByDocumentRequestAndMember(
    documentRequestId: number,
    committeeMemberId: number,
  ): Promise<DocumentRequestVote | null>;
  deleteByDocumentRequestId(documentRequestId: number): Promise<void>;
}
