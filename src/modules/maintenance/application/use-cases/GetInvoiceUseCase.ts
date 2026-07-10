import { Invoice } from "../../domain/entities/Invoice";
import { IInvoiceRepository } from "../../domain/repositories/IInvoiceRepository";
import { UserRole } from "../../../auth/domain/entities/User";
import {
  InvoiceNotFoundError,
  UnauthorizedInvoiceAccessError,
} from "../../domain/errors/MaintenanceErrors";
import { RequestingUser } from "../../../../shared/types/RequestingUser";

export class GetInvoiceUseCase {
  constructor(private readonly invoiceRepository: IInvoiceRepository) {}

  async execute(id: number, requestingUser: RequestingUser): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findById(id);

    if (!invoice) {
      throw new InvoiceNotFoundError(id);
    }

    if (
      requestingUser.role === UserRole.RESIDENT &&
      invoice.residentId !== requestingUser.residentId
    ) {
      throw new UnauthorizedInvoiceAccessError();
    }

    return invoice;
  }
}