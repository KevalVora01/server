import { PaginatedRequest, PaginatedResult } from "../../../../shared/types/Pagination";
import { Complaint } from "../../domain/entities/Complaint";
import { IComplaintRepository } from "../../domain/repositories/IComplaintRepository";
import { IResidentRepository } from "../../../residents/domain/repositories/IResidentRepository";
import { UnauthorizedComplaintAccessError } from "../../domain/errors/ComplaintErrors";

export class ListApartmentComplaintsUseCase {
  constructor(
    private readonly complaintRepository: IComplaintRepository,
    private readonly residentRepository: IResidentRepository,
  ) { }

  async execute(requestingResidentId: number, pagination: PaginatedRequest): Promise<PaginatedResult<Complaint>> {
    const resident = await this.residentRepository.findById(requestingResidentId);

    if (!resident || !resident.isActive) {
      throw new UnauthorizedComplaintAccessError();
    }

    // The apartment-wide complaint view is meant for the non-occupying owner
    // to review the tenant's complaints only. Occupants use their own list
    // (GET /complaints/my), so here we return complaints raised by non-owner
    // residents (tenants) of the apartment.
    return this.complaintRepository.findTenantComplaintsByApartmentId(resident.apartmentId, pagination);
  }
}
