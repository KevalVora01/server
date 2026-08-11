import { Op } from "sequelize";
import { IResidentRepository } from "../../domain/repositories/IResidentRepository";
import { IUserRepository } from "../../../auth/domain/repositories/IUserRepository";
import {
  ResidentNotFoundError,
  ResidentAlreadyInactiveError,
  OwnerHasActiveTenantError,
  PendingMaintenanceDuesForDeactivationError,
} from "../../domain/errors/ResidentErrors";
import { InvoiceModel } from "../../../maintenance/infrastructure/models/InvoiceModel";
import { InvoiceStatus } from "../../../maintenance/domain/entities/Invoice";
import { VisitorModel } from "../../../visitors/infrastructure/models/VisitorModel";
import { VisitorStatus } from "../../../visitors/domain/entities/Visitor";
import { DocumentRequestModel, DocumentRequestStatus } from "../../../document-requests/infrastructure/models/DocumentRequestModel";
import { ComplaintModel } from "../../../complaints/infrastructure/models/ComplaintModel";
import { ComplaintStatus } from "../../../complaints/domain/entities/Complaint";
import { getIO } from "../../../../shared/socket/socket.server";
import { SOCKET_EVENTS } from "../../../../shared/socket/socket.events";

export class DeactivateResidentUseCase {
  constructor(
    private readonly residentRepository: IResidentRepository,
    private readonly userRepository: IUserRepository
  ) {}

  async execute(id: number): Promise<void> {
    // 1. Check resident exists
    const resident = await this.residentRepository.findById(id);
    if (!resident) {
      throw new ResidentNotFoundError();
    }

    // 2. Check not already deactivated
    if (!resident.isActive) {
      throw new ResidentAlreadyInactiveError();
    }

    // 3. Prevent deactivating tenants directly from residents list
    if (!resident.isOwner) {
      throw new Error("Tenants cannot be deactivated directly from the Resident page.");
    }

    // 4. Verify owner does not have any active tenants
    if (resident.isOwner) {
      const activeTenant = await this.residentRepository.findActiveTenantByApartmentId(resident.apartmentId);
      if (activeTenant) {
        throw new OwnerHasActiveTenantError();
      }
    }

    // 5. Verify no pending/unpaid maintenance dues for this specific resident
    const pendingInvoicesCount = await InvoiceModel.count({
      where: {
        residentId: resident.id!,
        status: { [Op.in]: [InvoiceStatus.PENDING, InvoiceStatus.OVERDUE] },
      },
    });

    if (pendingInvoicesCount > 0) {
      throw new PendingMaintenanceDuesForDeactivationError();
    }

    const residentId = resident.id!;

    // 6. Deactivate both resident and linked user
    await this.residentRepository.deactivate(id);
    await this.userRepository.deactivate(resident.userId);

    // 7. Reject all pending/approved pre-registered visitors for this resident
    await VisitorModel.update(
      { status: VisitorStatus.REJECTED },
      {
        where: {
          residentId,
          status: { [Op.in]: [VisitorStatus.PENDING, VisitorStatus.APPROVED] },
        },
      }
    );

    getIO().emit(SOCKET_EVENTS.VISITOR_UPDATED, { apartmentId: resident.apartmentId });

    // 8. Reject all pending/approved document requests for this resident
    await DocumentRequestModel.update(
      {
        status: DocumentRequestStatus.REJECTED,
        rejectionReason: "Resident deactivated by admin",
      },
      {
        where: {
          [Op.or]: [
            { requesterId: residentId },
            { targetId: residentId },
          ],
          status: { [Op.in]: [DocumentRequestStatus.PENDING, DocumentRequestStatus.APPROVED] },
        },
      }
    );

    // 9. Delete all open / in-progress complaints submitted by this resident
    await ComplaintModel.destroy({
      where: {
        residentId,
        status: { [Op.in]: [ComplaintStatus.OPEN, ComplaintStatus.IN_PROGRESS] },
      },
    });
  }
}