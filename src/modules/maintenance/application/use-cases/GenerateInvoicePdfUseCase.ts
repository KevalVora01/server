import { IInvoiceRepository } from "../../domain/repositories/IInvoiceRepository";
import { InvoicePdfService } from "../../infrastructure/services/InvoicePdfService";
import { InvoiceNotFoundError } from "../../domain/errors/MaintenanceErrors";
import { IResidentRepository } from "../../../residents/domain/repositories/IResidentRepository";

export class GenerateInvoicePdfUseCase {
  constructor(
    private readonly invoiceRepository: IInvoiceRepository,
    private readonly invoicePdfService: InvoicePdfService,
    private readonly residentRepository: IResidentRepository,
  ) { }

  async execute(invoiceId: number): Promise<string> {
    const invoice = await this.invoiceRepository.findById(invoiceId);

    if (!invoice) {
      throw new InvoiceNotFoundError(invoiceId);
    }

    // Find the current occupant for this apartment
    let resident = null;
    if (invoice.residentId) {
      resident = await this.residentRepository.findById(invoice.residentId);
    } else {
      // Find current occupant of the apartment
      const occupants = await this.residentRepository.findActiveOccupantsByApartmentId(invoice.apartmentId);
      resident = occupants[0] ?? null;
    }

    const pdfUrl = await this.invoicePdfService.generateAndUpload(invoice, resident);

    invoice.setPdfUrl(pdfUrl);
    await this.invoiceRepository.update(invoice);

    return pdfUrl;
  }
}