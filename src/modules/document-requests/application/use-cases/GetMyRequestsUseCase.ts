import { DocumentRequest } from "../../domain/entities/DocumentRequest";
import { IDocumentRequestRepository } from "../../domain/repositories/IDocumentRequestRepository";

export class GetMyRequestsUseCase {
  constructor(
    private readonly documentRequestRepository: IDocumentRequestRepository,
  ) {}

  async execute(residentIds: number[]): Promise<DocumentRequest[]> {
    if (residentIds.length === 0) return [];
    return this.documentRequestRepository.findMyRequests(residentIds);
  }
}
