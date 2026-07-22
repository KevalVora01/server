import { DocumentRequest } from "../../domain/entities/DocumentRequest";
import { IDocumentRequestRepository } from "../../domain/repositories/IDocumentRequestRepository";
import { DocumentRequestNotFoundError } from "../../domain/errors/DocumentRequestErrors";

export class RejectRequestUseCase {
  constructor(
    private readonly documentRequestRepository: IDocumentRequestRepository,
  ) {}

  async execute(id: number, reason?: string): Promise<DocumentRequest> {
    const request = await this.documentRequestRepository.findById(id);
    if (!request) {
      throw new DocumentRequestNotFoundError(id);
    }

    request.reject(reason);
    return this.documentRequestRepository.update(request);
  }
}
