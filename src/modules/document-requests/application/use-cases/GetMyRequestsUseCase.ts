import { DocumentRequest } from "../../domain/entities/DocumentRequest";
import { IDocumentRequestRepository } from "../../domain/repositories/IDocumentRequestRepository";

export class GetMyRequestsUseCase {
  constructor(
    private readonly documentRequestRepository: IDocumentRequestRepository,
  ) {}

  async execute(residentId?: number | null): Promise<DocumentRequest[]> {
    if (!residentId) return [];
    return this.documentRequestRepository.findMyRequests(residentId);
  }
}
