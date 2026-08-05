import { Invoice } from "../../domain/entities/Invoice";
import { IInvoiceRepository } from "../../domain/repositories/IInvoiceRepository";
import { IResidentRepository } from "../../../residents/domain/repositories/IResidentRepository";
import { UserRole } from "../../../auth/domain/entities/User";
import { RequestingUser } from "../../../../shared/types/RequestingUser";
import {
  InvoiceNotFoundError,
  InvoiceAlreadyPaidError,
  InvalidChequeNumberError,
  InvalidUpiRefError,
  UnauthorizedInvoiceAccessError,
} from "../../domain/errors/MaintenanceErrors";
import { GenerateInvoicePdfUseCase } from "./GenerateInvoicePdfUseCase";
import { IMaintenanceNotifier } from "../../domain/services/IMaintenanceNotifier";

export class MarkInvoiceSettledUseCase {
  constructor(
    private readonly invoiceRepository: IInvoiceRepository,
    private readonly generateInvoicePdfUseCase: GenerateInvoicePdfUseCase,
    private readonly maintenanceNotifier: IMaintenanceNotifier,
    private readonly residentRepository: IResidentRepository,
  ) {}

  async execute(invoiceId: number, paymentRef?: string, requestingUser?: RequestingUser): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findById(invoiceId);

    if (!invoice) {
      throw new InvoiceNotFoundError(invoiceId);
    }

    if (requestingUser && requestingUser.role === UserRole.RESIDENT) {
      let invoiceResidentId: number | null = invoice.residentId;
      if (!invoiceResidentId) {
        const occupant = await this.residentRepository.findActiveOccupantByApartmentId(invoice.apartmentId);
        invoiceResidentId = occupant?.id ?? null;
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

    if (invoice.isPaid()) {
      throw new InvoiceAlreadyPaidError();
    }

    if (!paymentRef || !paymentRef.toUpperCase().startsWith("UPI")) {
      throw new Error("Only instant UPI digital payments are accepted. Cash and Cheque transactions have been disabled.");
    }

    const utrPart = paymentRef.replace(/^UPI\s*[-:]?\s*/i, "").trim();
    if (utrPart && !/^\d{12}$/.test(utrPart)) {
      throw new InvalidUpiRefError();
    }

    invoice.markPaid(paymentRef, new Date());

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

  private async isOwnerOfInvoicesApartment(
    requestingResidentId: number | undefined,
    invoiceResidentId: number | null,
    invoiceApartmentId: number
  ): Promise<boolean> {
    if (!requestingResidentId) return false;

    const requestingResident = await this.residentRepository.findById(requestingResidentId);
    if (!requestingResident) return false;

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