import { PaginatedResult } from "../../../../shared/types/Pagination";
import { Complaint } from "../../domain/entities/Complaint";
import { IComplaintRepository, ListComplaintsFilters } from "../../domain/repositories/IComplaintRepository";

export class ListComplaintsUseCase {
  constructor(private readonly complaintRepository: IComplaintRepository) { }

  async execute(filters: ListComplaintsFilters): Promise<PaginatedResult<Complaint>> {
    return this.complaintRepository.findAll(filters);
  }
}