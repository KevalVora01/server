import { IInvoiceRepository } from "../../domain/repositories/IInvoiceRepository";
import { StripeService } from "../../infrastructure/services/StripeService";
import { IMaintenanceNotifier } from "../../domain/services/IMaintenanceNotifier";
import { GenerateInvoicePdfUseCase } from "./GenerateInvoicePdfUseCase";
import { InvoiceNotFoundError, InvalidPaymentAmountError } from "../../domain/errors/MaintenanceErrors";

export interface ConfirmPaymentDto {
  invoiceId: number;
  paymentIntentId: string;
}

export class ConfirmPaymentUseCase {
  constructor(
    private readonly invoiceRepository: IInvoiceRepository,
    private readonly stripeService: StripeService,
    private readonly maintenanceNotifier: IMaintenanceNotifier,
    private readonly generateInvoicePdfUseCase: GenerateInvoicePdfUseCase,
  ) {}

  async execute(dto: ConfirmPaymentDto): Promise<void> {
    const paymentIntent = await this.stripeService.retrievePaymentIntent(dto.paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      throw new Error("Payment has not succeeded");
    }

    const invoiceIdFromMetadata = Number(paymentIntent.metadata.invoiceId);
    if (invoiceIdFromMetadata !== dto.invoiceId) {
      throw new Error("Invoice ID mismatch");
    }

    const invoice = await this.invoiceRepository.findById(dto.invoiceId);
    if (!invoice) {
      throw new InvoiceNotFoundError(dto.invoiceId);
    }

    if (invoice.isPaid()) {
      return;
    }

    const amountReceivedInRupees = paymentIntent.amount_received / 100;
    if (Math.abs(amountReceivedInRupees - invoice.totalAmount) > 0.01) {
      throw new InvalidPaymentAmountError();
    }

    invoice.markPaid(dto.paymentIntentId);
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
