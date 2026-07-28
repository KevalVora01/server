import { DocumentRequest } from "../../domain/entities/DocumentRequest";
import { IDocumentRequestRepository } from "../../domain/repositories/IDocumentRequestRepository";

export class GetReceivedRequestsUseCase {
  constructor(
    private readonly documentRequestRepository: IDocumentRequestRepository,
  ) {}

  async execute(residentId?: number | null, isAdmin: boolean = false): Promise<DocumentRequest[]> {
    if (isAdmin) {
      return this.documentRequestRepository.findAdminReceivedRequests();
    }
    if (!residentId) return [];
    return this.documentRequestRepository.findReceivedRequests(residentId);
  }
}
