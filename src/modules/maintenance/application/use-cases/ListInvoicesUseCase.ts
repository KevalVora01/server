import { PaginatedResult } from "../../../../shared/types/Pagination";
import { Invoice } from "../../domain/entities/Invoice";
import { IInvoiceRepository, ListInvoicesFilters } from "../../domain/repositories/IInvoiceRepository";


export class ListInvoicesUseCase {
  constructor(private readonly invoiceRepository: IInvoiceRepository) {}

  async execute(filters: ListInvoicesFilters): Promise<PaginatedResult<Invoice>> {
    return this.invoiceRepository.findAll(filters);
  }
}