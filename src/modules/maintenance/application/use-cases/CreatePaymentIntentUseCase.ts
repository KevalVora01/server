import { IInvoiceRepository } from "../../domain/repositories/IInvoiceRepository";
import { StripeService } from "../../infrastructure/services/StripeService";
import { IResidentRepository } from "../../../residents/domain/repositories/IResidentRepository";
import { CreatePaymentIntentDto } from "../dtos/CreatePaymentIntentDto";
import {
  InvoiceNotFoundError,
  InvoiceAlreadyPaidError,
  ResidentNotOccupantError,
} from "../../domain/errors/MaintenanceErrors";

export interface PaymentIntentResult {
  clientSecret: string;
  amount: number;
}

export class CreatePaymentIntentUseCase {
  constructor(
    private readonly invoiceRepository: IInvoiceRepository,
    private readonly stripeService: StripeService,
    private readonly residentRepository: IResidentRepository,
  ) { }

  async execute(dto: CreatePaymentIntentDto): Promise<PaymentIntentResult> {
    const invoice = await this.invoiceRepository.findById(dto.invoiceId);

    if (!invoice) {
      throw new InvoiceNotFoundError(dto.invoiceId);
    }

    if (invoice.isPaid()) {
      throw new InvoiceAlreadyPaidError();
    }

    const resident = await this.residentRepository.findById(invoice.residentId);

    if (!resident || !resident.isOccupant) {
      throw new ResidentNotOccupantError();
    }

    const { clientSecret } = await this.stripeService.createPaymentIntent(invoice.totalAmount, invoice.id!);

    return { clientSecret, amount: invoice.totalAmount };
  }
}