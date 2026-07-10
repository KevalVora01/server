import { Invoice } from "../../domain/entities/Invoice";
import { IInvoiceRepository } from "../../domain/repositories/IInvoiceRepository";
import { InvoiceNotFoundError, InvoiceAlreadyPaidError } from "../../domain/errors/MaintenanceErrors";

export class MarkInvoiceSettledUseCase {
  constructor(private readonly invoiceRepository: IInvoiceRepository) {}

  async execute(invoiceId: number): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findById(invoiceId);

    if (!invoice) {
      throw new InvoiceNotFoundError(invoiceId);
    }

    if (invoice.isPaid()) {
      throw new InvoiceAlreadyPaidError();
    }

    invoice.markPaid("MANUAL_OFFLINE", new Date());

    return this.invoiceRepository.update(invoice);
  }
}