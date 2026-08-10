import { PaginatedResult } from "../../../../shared/types/Pagination";
import { Complaint } from "../../domain/entities/Complaint";
import { IComplaintRepository, ListComplaintsFilters } from "../../domain/repositories/IComplaintRepository";

export class ListMyComplaintsUseCase {
  constructor(private readonly complaintRepository: IComplaintRepository) { }

  async execute(residentId: number, filters: ListComplaintsFilters): Promise<PaginatedResult<Complaint>> {
    return this.complaintRepository.findByResidentId(residentId, filters);
  }
}