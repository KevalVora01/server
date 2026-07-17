import { PaginatedRequest, PaginatedResult } from "../../../../shared/types/Pagination";
import { Invoice } from "../../domain/entities/Invoice";
import { IInvoiceRepository } from "../../domain/repositories/IInvoiceRepository";
import { IResidentRepository } from "../../../residents/domain/repositories/IResidentRepository";

export class ListMyInvoicesUseCase {
  constructor(
    private readonly invoiceRepository: IInvoiceRepository,
    private readonly residentRepository: IResidentRepository,
  ) { }

  async execute(residentId: number, pagination: PaginatedRequest): Promise<PaginatedResult<Invoice>> {
    const resident = await this.residentRepository.findById(residentId);
    if (!resident || !resident.isOccupant) {
      // Non-occupants don't have invoices to pay
      return { items: [], totalCount: 0, pageNumber: pagination.pageNumber, pageSize: pagination.pageSize, totalPages: 0, hasNextPage: false, hasPreviousPage: false };
    }
    return this.invoiceRepository.findByApartmentForOccupant(residentId, pagination);
  }
}