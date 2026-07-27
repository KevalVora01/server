import { IDocumentRequestRepository, IDocumentRequestDetail } from "../../domain/repositories/IDocumentRequestRepository";
import { DocumentRequestNotFoundError } from "../../domain/errors/DocumentRequestErrors";

export class GetDocumentRequestDetailUseCase {
  constructor(
    private readonly documentRequestRepository: IDocumentRequestRepository,
  ) {}

  async execute(id: number): Promise<IDocumentRequestDetail> {
    const detail = await this.documentRequestRepository.findWithDetail(id);
    if (!detail) {
      throw new DocumentRequestNotFoundError(id);
    }
    return detail;
  }
}
