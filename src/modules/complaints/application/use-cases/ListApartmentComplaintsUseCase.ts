import { PaginatedRequest, PaginatedResult } from "../../../../shared/types/Pagination";
import { Complaint } from "../../domain/entities/Complaint";
import { IComplaintRepository } from "../../domain/repositories/IComplaintRepository";

export class ListApartmentComplaintsUseCase {
  constructor(private readonly complaintRepository: IComplaintRepository) { }

  async execute(apartmentId: number, pagination: PaginatedRequest): Promise<PaginatedResult<Complaint>> {
    return this.complaintRepository.findByApartmentId(apartmentId, pagination);
  }
}
