import { PaginatedRequest, PaginatedResult } from "../../../../shared/types/Pagination";
import { Complaint } from "../../domain/entities/Complaint";
import { IComplaintRepository } from "../../domain/repositories/IComplaintRepository";

export class ListMyComplaintsUseCase {
  constructor(private readonly complaintRepository: IComplaintRepository) { }

  async execute(residentId: number, pagination: PaginatedRequest): Promise<PaginatedResult<Complaint>> {
    return this.complaintRepository.findByResidentId(residentId, pagination);
  }
}