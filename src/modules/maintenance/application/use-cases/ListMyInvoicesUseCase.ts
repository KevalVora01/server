import { PaginatedRequest, PaginatedResult } from "../../../../shared/types/Pagination";
import { Invoice } from "../../domain/entities/Invoice";
import { IInvoiceRepository } from "../../domain/repositories/IInvoiceRepository";

export class ListMyInvoicesUseCase {
  constructor(private readonly invoiceRepository: IInvoiceRepository) { }

  async execute(residentId: number, pagination: PaginatedRequest): Promise<PaginatedResult<Invoice>> {
    return this.invoiceRepository.findByResidentId(residentId, pagination);
  }
}