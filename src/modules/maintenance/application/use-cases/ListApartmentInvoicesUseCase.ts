import { Invoice } from "../../domain/entities/Invoice";
import { IInvoiceRepository, ListInvoicesFilters } from "../../domain/repositories/IInvoiceRepository";
import { IResidentRepository } from "../../../residents/domain/repositories/IResidentRepository";
import { PaginatedResult } from "../../../../shared/types/Pagination";
import { UnauthorizedInvoiceAccessError } from "../../domain/errors/MaintenanceErrors";

export class ListApartmentInvoicesUseCase {
  constructor(
    private readonly invoiceRepository: IInvoiceRepository,
    private readonly residentRepository: IResidentRepository,
  ) {}

  async execute(requestingResidentId: number, filters: ListInvoicesFilters): Promise<PaginatedResult<Invoice>> {
    const requestingResident = await this.residentRepository.findById(requestingResidentId);

    if (!requestingResident || !requestingResident.isOwner) {
      throw new UnauthorizedInvoiceAccessError();
    }

    return this.invoiceRepository.findByApartmentId(requestingResident.apartmentId, filters);
  }
}