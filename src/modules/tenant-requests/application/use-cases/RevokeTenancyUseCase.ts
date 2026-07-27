import { IResidentRepository } from "../../../residents/domain/repositories/IResidentRepository";
import { IUserRepository } from "../../../auth/domain/repositories/IUserRepository";
import { notificationService } from "../../../notifications/container";
import { NoActiveTenantToRevokeError } from "../../domain/errors/TenantRequestErrors";

export class RevokeTenancyUseCase {
  constructor(
    private readonly residentRepository: IResidentRepository,
    private readonly userRepository: IUserRepository,
  ) { }

  async execute(apartmentId: number): Promise<void> {
    const occupant = await this.residentRepository.findActiveTenantByApartmentId(apartmentId);

    if (!occupant) {
      throw new NoActiveTenantToRevokeError();
    }

    const tenantUserId = occupant.userId;

    occupant.deactivate();
    occupant.markAsNonOccupant();
    occupant.updateMoveOutDate(new Date());
    await this.residentRepository.update(occupant);

    // Dormant, not deleted: the User record is disabled so the tenant
    // can no longer log in, but can be reused on a future re-approval.
    await this.userRepository.deactivate(tenantUserId);

    const owner = await this.residentRepository.findActiveByApartmentId(apartmentId);
    if (owner) {
      owner.markAsOccupant();
      await this.residentRepository.update(owner);
    }

    await this.notifyTenant(tenantUserId, apartmentId);
  }

  private async notifyTenant(userId: number, apartmentId: number): Promise<void> {
    try {
      await notificationService.notify(
        userId,
        "tenancy_revoked",
        "Your tenancy has been ended",
        "The apartment owner has ended your tenancy. Your account access has been revoked.",
        { apartmentId }
      );
    } catch (error) {
      console.error("Failed to notify tenant of tenancy revocation", error);
    }
  }
}