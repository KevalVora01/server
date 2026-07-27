import { DocumentRequest, DocumentRequestStatus, RequestRole } from "../../domain/entities/DocumentRequest";
import { IDocumentRequestRepository } from "../../domain/repositories/IDocumentRequestRepository";
import { CloudinaryService } from "../../../../shared/services/CloudinaryService";
import { DocumentRequestNotFoundError, DocumentRequestNotReadyForUploadError } from "../../domain/errors/DocumentRequestErrors";

export class UploadDocumentUseCase {
  constructor(
    private readonly documentRequestRepository: IDocumentRequestRepository,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async execute(id: number, fileBuffer: Buffer, originalName: string): Promise<DocumentRequest> {
    const request = await this.documentRequestRepository.findById(id);
    if (!request) {
      throw new DocumentRequestNotFoundError(id);
    }

    if (request.targetRole === RequestRole.ADMIN && request.status !== DocumentRequestStatus.APPROVED) {
      throw new DocumentRequestNotReadyForUploadError();
    }

    const secureUrl = await this.cloudinaryService.uploadImage(fileBuffer, "society_documents");
    request.fulfill(secureUrl, originalName);

    return this.documentRequestRepository.update(request);
  }
}
