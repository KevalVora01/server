import { PaginatedResult } from "../../../../shared/types/Pagination";
import { Invoice } from "../../domain/entities/Invoice";
import { IInvoiceRepository, ListInvoicesFilters } from "../../domain/repositories/IInvoiceRepository";
import { IResidentRepository } from "../../../residents/domain/repositories/IResidentRepository";

export class ListMyInvoicesUseCase {
  constructor(
    private readonly invoiceRepository: IInvoiceRepository,
    private readonly residentRepository: IResidentRepository,
  ) { }

  async execute(residentId: number, filters: ListInvoicesFilters): Promise<PaginatedResult<Invoice>> {
    const resident = await this.residentRepository.findById(residentId);
    if (!resident) {
      return { items: [], totalCount: 0, pageNumber: filters.pageNumber, pageSize: filters.pageSize, totalPages: 0, hasNextPage: false, hasPreviousPage: false };
    }

    return this.invoiceRepository.findByResidentId(residentId, filters);
  }
}