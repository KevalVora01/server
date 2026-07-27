import { DocumentRequest, DocumentRequestStatus, RequestRole } from "../../domain/entities/DocumentRequest";
import { IDocumentRequestRepository } from "../../domain/repositories/IDocumentRequestRepository";
import { CloudinaryService } from "../../../../shared/services/CloudinaryService";
import { IDocumentRequestNotifier } from "../../domain/services/IDocumentRequestNotifier";
import { DocumentRequestNotFoundError, DocumentRequestNotReadyForUploadError } from "../../domain/errors/DocumentRequestErrors";

export class UploadDocumentUseCase {
  constructor(
    private readonly documentRequestRepository: IDocumentRequestRepository,
    private readonly cloudinaryService: CloudinaryService,
    private readonly documentRequestNotifier?: IDocumentRequestNotifier,
  ) {}

  async execute(id: number, fileBuffer: Buffer, originalName: string): Promise<DocumentRequest> {
    const request = await this.documentRequestRepository.findById(id);
    if (!request) {
      throw new DocumentRequestNotFoundError(id);
    }

    if (request.targetRole === RequestRole.ADMIN && request.status !== DocumentRequestStatus.APPROVED) {
      throw new DocumentRequestNotReadyForUploadError();
    }

    const oldStatus = request.status;
    const secureUrl = await this.cloudinaryService.uploadImage(fileBuffer, "society_documents");
    request.fulfill(secureUrl, originalName);

    const updated = await this.documentRequestRepository.update(request);

    if (this.documentRequestNotifier) {
      await this.documentRequestNotifier.notifyStatusChanged(updated, oldStatus);
    }

    return updated;
  }
}
