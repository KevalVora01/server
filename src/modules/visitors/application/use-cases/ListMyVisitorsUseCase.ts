import { Visitor } from "../../domain/entities/Visitor";
import { IVisitorRepository } from "../../domain/repositories/IVisitorRepository";
import { IResidentRepository } from "../../../residents/domain/repositories/IResidentRepository";
import { PaginatedRequest, PaginatedResult } from "../../../../shared/types/Pagination";

export class ListMyVisitorsUseCase {
  constructor(
    private readonly visitorRepository: IVisitorRepository,
    private readonly residentRepository: IResidentRepository,
  ) {}

  async execute(requestingResidentId: number, pagination: PaginatedRequest): Promise<PaginatedResult<Visitor>> {
    const resident = await this.residentRepository.findById(requestingResidentId);

    if (!resident) {
      throw new Error("Resident not found");
    }
    
    return this.visitorRepository.findByApartmentId(resident.apartmentId, pagination);
  }
}