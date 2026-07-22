import { DocumentRequest } from "../../domain/entities/DocumentRequest";
import { IDocumentRequestRepository } from "../../domain/repositories/IDocumentRequestRepository";

export class GetReceivedRequestsUseCase {
  constructor(
    private readonly documentRequestRepository: IDocumentRequestRepository,
  ) {}

  async execute(residentIds: number[], isAdmin: boolean): Promise<DocumentRequest[]> {
    if (isAdmin) {
      return this.documentRequestRepository.findAdminReceivedRequests();
    }
    if (residentIds.length === 0) return [];
    return this.documentRequestRepository.findReceivedRequests(residentIds);
  }
}
