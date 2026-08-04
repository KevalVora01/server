import { IDocumentRequestRepository } from "../../domain/repositories/IDocumentRequestRepository";
import { IDocumentRequestNotifier } from "../../domain/services/IDocumentRequestNotifier";
import { DocumentRequestNotFoundError } from "../../domain/errors/DocumentRequestErrors";

export class CancelRequestUseCase {
  constructor(
    private readonly documentRequestRepository: IDocumentRequestRepository,
    private readonly documentRequestNotifier?: IDocumentRequestNotifier,
  ) {}

  async execute(id: number): Promise<void> {
    const request = await this.documentRequestRepository.findById(id);
    if (!request) {
      throw new DocumentRequestNotFoundError(id);
    }

    await this.documentRequestRepository.delete(id);
  }
}
