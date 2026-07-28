import { DocumentRequest } from "../entities/DocumentRequest";
import { DocumentRequestVote } from "../entities/DocumentRequestVote";

export interface IDocumentRequestDetail {
  request: DocumentRequest;
  votes: DocumentRequestVote[];
  committeeMembers: { id: number; fullName: string; email: string; apartmentId: number }[];
}

export interface IDocumentRequestRepository {
  create(request: DocumentRequest): Promise<DocumentRequest>;
  findById(id: number): Promise<DocumentRequest | null>;
  findMyRequests(residentId: number): Promise<DocumentRequest[]>;
  findReceivedRequests(residentId: number): Promise<DocumentRequest[]>;
  findAdminReceivedRequests(): Promise<DocumentRequest[]>;
  findWithDetail(id: number): Promise<IDocumentRequestDetail | null>;
  update(request: DocumentRequest): Promise<DocumentRequest>;
  delete(id: number): Promise<void>;
}
