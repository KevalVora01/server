import { IInvoiceRepository } from "../../domain/repositories/IInvoiceRepository";
import { IMaintenanceNotifier } from "../../domain/services/IMaintenanceNotifier";
import { GenerateInvoicePdfUseCase } from "./GenerateInvoicePdfUseCase";
import { InvoiceNotFoundError, InvalidPaymentAmountError } from "../../domain/errors/MaintenanceErrors";

export interface StripePaymentSucceededPayload {
  invoiceId: number;
  paymentIntentId: string;
  amountReceived: number; // smallest currency unit (paise)
}

export class HandleStripePaymentSucceededUseCase {
  constructor(
    private readonly invoiceRepository: IInvoiceRepository,
    private readonly maintenanceNotifier: IMaintenanceNotifier,
    private readonly generateInvoicePdfUseCase: GenerateInvoicePdfUseCase,
  ) {}

  async execute(payload: StripePaymentSucceededPayload): Promise<void> {
    const invoice = await this.invoiceRepository.findById(payload.invoiceId);

    if (!invoice) {
      throw new InvoiceNotFoundError(payload.invoiceId);
    }

    if (invoice.isPaid()) {
      return; // idempotent — webhook may fire more than once
    }

    const amountReceivedInRupees = payload.amountReceived / 100;
    if (Math.abs(amountReceivedInRupees - invoice.totalAmount) > 0.01) {
      throw new InvalidPaymentAmountError();
    }

    invoice.markPaid(payload.paymentIntentId);
    await this.invoiceRepository.update(invoice);

    try {
      await this.generateInvoicePdfUseCase.execute(invoice.id!);
    } catch (error) {
      console.error("Failed to generate invoice PDF:", error);
    }

    try {
      await this.maintenanceNotifier.notifyPaymentSucceeded(invoice);
    } catch (error) {
      console.error("Failed to send payment notification:", error);
    }
  }
}