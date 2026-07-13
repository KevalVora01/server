import { Invoice } from "../../domain/entities/Invoice";
import { IInvoiceRepository } from "../../domain/repositories/IInvoiceRepository";
import { InvoiceNotFoundError, InvoiceAlreadyPaidError, InvalidChequeNumberError } from "../../domain/errors/MaintenanceErrors";
import { GenerateInvoicePdfUseCase } from "./GenerateInvoicePdfUseCase";
import { IMaintenanceNotifier } from "../../domain/services/IMaintenanceNotifier";

export class MarkInvoiceSettledUseCase {
  constructor(
    private readonly invoiceRepository: IInvoiceRepository,
    private readonly generateInvoicePdfUseCase: GenerateInvoicePdfUseCase,
    private readonly maintenanceNotifier: IMaintenanceNotifier,
  ) {}

  async execute(invoiceId: number, paymentRef?: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findById(invoiceId);

    if (!invoice) {
      throw new InvoiceNotFoundError(invoiceId);
    }

    if (invoice.isPaid()) {
      throw new InvoiceAlreadyPaidError();
    }

    if (paymentRef && paymentRef.startsWith("Cheque - ")) {
      const chequePart = paymentRef.replace("Cheque - #", "").replace("Cheque - ", "").trim();
      if (!/^\d{6}$/.test(chequePart)) {
        throw new InvalidChequeNumberError();
      }
    }

    invoice.markPaid(paymentRef || "MANUAL_OFFLINE", new Date());

    const updatedInvoice = await this.invoiceRepository.update(invoice);

    try {
      await this.generateInvoicePdfUseCase.execute(invoice.id!);
    } catch (error) {
      console.error("Failed to generate invoice PDF during manual settlement:", error);
    }

    const finalInvoice = await this.invoiceRepository.findById(invoice.id!);
    const resolvedInvoice = finalInvoice || updatedInvoice;

    try {
      await this.maintenanceNotifier.notifyPaymentSucceeded(resolvedInvoice);
    } catch (error) {
      console.error("Failed to send payment notification:", error);
    }

    return resolvedInvoice;
  }
}