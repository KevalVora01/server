import { Invoice } from "../../domain/entities/Invoice";
import { IInvoiceRepository } from "../../domain/repositories/IInvoiceRepository";
import { IResidentRepository } from "../../../residents/domain/repositories/IResidentRepository";
import { UserRole } from "../../../auth/domain/entities/User";
import {
  InvoiceNotFoundError,
  UnauthorizedInvoiceAccessError,
} from "../../domain/errors/MaintenanceErrors";
import { RequestingUser } from "../../../../shared/types/RequestingUser";

export class GetInvoiceUseCase {
  constructor(
    private readonly invoiceRepository: IInvoiceRepository,
    private readonly residentRepository: IResidentRepository,
  ) { }

  async execute(id: number, requestingUser: RequestingUser): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findById(id);

    if (!invoice) {
      throw new InvoiceNotFoundError(id);
    }

    if (requestingUser.role === UserRole.RESIDENT) {
      const isOwnInvoice = invoice.residentId === requestingUser.residentId;

      if (!isOwnInvoice) {
        const isApartmentOwner = await this.isOwnerOfInvoicesApartment(
          requestingUser.residentId,
          invoice.residentId
        );

        if (!isApartmentOwner) {
          throw new UnauthorizedInvoiceAccessError();
        }
      }
    }

    return invoice;
  }

  private async isOwnerOfInvoicesApartment(
    requestingResidentId: number | undefined,
    invoiceResidentId: number
  ): Promise<boolean> {
    if (!requestingResidentId) return false;

    const requestingResident = await this.residentRepository.findById(requestingResidentId);
    const invoiceResident = await this.residentRepository.findById(invoiceResidentId);

    if (!requestingResident || !invoiceResident) return false;

    return (
      requestingResident.isOwner &&
      requestingResident.apartmentId === invoiceResident.apartmentId
    );
  }
}