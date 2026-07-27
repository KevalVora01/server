import { DocumentRequest } from "../../domain/entities/DocumentRequest";
import { IDocumentRequestRepository } from "../../domain/repositories/IDocumentRequestRepository";
import { IDocumentRequestNotifier } from "../../domain/services/IDocumentRequestNotifier";
import { DocumentRequestNotFoundError } from "../../domain/errors/DocumentRequestErrors";

export class RejectRequestUseCase {
  constructor(
    private readonly documentRequestRepository: IDocumentRequestRepository,
    private readonly documentRequestNotifier?: IDocumentRequestNotifier,
  ) {}

  async execute(id: number, reason?: string): Promise<DocumentRequest> {
    const request = await this.documentRequestRepository.findById(id);
    if (!request) {
      throw new DocumentRequestNotFoundError(id);
    }

    const oldStatus = request.status;
    request.reject(reason);

    const updated = await this.documentRequestRepository.update(request);

    if (this.documentRequestNotifier) {
      await this.documentRequestNotifier.notifyStatusChanged(updated, oldStatus);
    }

    return updated;
  }
}
