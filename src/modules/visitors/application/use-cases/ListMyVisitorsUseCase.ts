import { Visitor, VisitorStatus } from "../../domain/entities/Visitor";
import { IVisitorRepository } from "../../domain/repositories/IVisitorRepository";
import { IResidentRepository } from "../../../residents/domain/repositories/IResidentRepository";
import { ResidentNotFoundError } from "../../../residents/domain/errors/ResidentErrors";
import { PaginatedRequest, PaginatedResult } from "../../../../shared/types/Pagination";

export class ListMyVisitorsUseCase {
  constructor(
    private readonly visitorRepository: IVisitorRepository,
    private readonly residentRepository: IResidentRepository,
  ) {}

  async execute(
    requestingResidentId: number,
    pagination: PaginatedRequest,
    filters?: { status?: VisitorStatus; search?: string },
  ): Promise<PaginatedResult<Visitor>> {
    const resident = await this.residentRepository.findById(requestingResidentId);

    if (!resident) {
      throw new ResidentNotFoundError();
    }
    
    return this.visitorRepository.findByApartmentId(resident.apartmentId, pagination, { ...filters, residentId: requestingResidentId });
  }
}