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
      // If invoice has a specific residentId, use that for ownership check
      // Otherwise, find the current occupant of the apartment
      let invoiceResidentId = invoice.residentId;
      if (!invoiceResidentId) {
        const occupants = await this.residentRepository.findActiveOccupantsByApartmentId(invoice.apartmentId);
        invoiceResidentId = occupants[0]?.id ?? null;
      }

      const isOwnInvoice = invoiceResidentId === requestingUser.residentId;

      if (!isOwnInvoice) {
        const isApartmentOwner = await this.isOwnerOfInvoicesApartment(
          requestingUser.residentId,
          invoiceResidentId,
          invoice.apartmentId
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
    invoiceResidentId: number | null,
    invoiceApartmentId: number
  ): Promise<boolean> {
    if (!requestingResidentId) return false;

    const requestingResident = await this.residentRepository.findById(requestingResidentId);
    if (!requestingResident) return false;

    // If invoice has no residentId, check if requester is owner of the apartment
    if (!invoiceResidentId) {
      return requestingResident.isOwner && requestingResident.apartmentId === invoiceApartmentId;
    }

    const invoiceResident = await this.residentRepository.findById(invoiceResidentId);
    if (!invoiceResident) return false;

    return (
      requestingResident.isOwner &&
      requestingResident.apartmentId === invoiceResident.apartmentId
    );
  }
}