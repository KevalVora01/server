import { DocumentRequest, RequestRole } from "../../domain/entities/DocumentRequest";
import { IDocumentRequestRepository } from "../../domain/repositories/IDocumentRequestRepository";
import { CreateDocumentRequestDto } from "../dtos/CreateDocumentRequestDto";
import { IResidentRepository } from "../../../residents/domain/repositories/IResidentRepository";
import { NoApartmentAssociatedError, DocumentOwnerNotFoundError } from "../../domain/errors/DocumentRequestErrors";

export class CreateDocumentRequestUseCase {
  constructor(
    private readonly documentRequestRepository: IDocumentRequestRepository,
    private readonly residentRepository: IResidentRepository,
  ) {}

  async execute(dto: CreateDocumentRequestDto, userId: number): Promise<DocumentRequest> {
    const resident = await this.residentRepository.findByUserId(userId);

    if (!resident || !resident.apartmentId) {
      throw new NoApartmentAssociatedError();
    }

    let targetId: number | null = null;
    let targetRole = RequestRole.OWNER;
    const requesterRole = resident.isOwner ? RequestRole.OWNER : RequestRole.TENANT;

    if (!resident.isOwner) {
      const ownerResident = await this.residentRepository.findOwnerByApartmentId(resident.apartmentId);
      if (!ownerResident) {
        throw new DocumentOwnerNotFoundError();
      }
      targetId = ownerResident.id!;
    } else {
      targetRole = RequestRole.ADMIN;
    }

    const request = DocumentRequest.create({
      apartmentId: resident.apartmentId,
      requesterId: resident.id!,
      requesterRole,
      targetId,
      targetRole,
      documentType: dto.documentType,
      customDocumentName: dto.customDocumentName || null,
      note: dto.note || null,
    });

    return this.documentRequestRepository.create(request);
  }
}
