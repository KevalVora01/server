import { IResidentRepository } from "../../../residents/domain/repositories/IResidentRepository";
import { NoActiveTenantToRevokeError } from "../../domain/errors/TenantRequestErrors";

export class RevokeTenancyUseCase {
  constructor(
    private readonly residentRepository: IResidentRepository,
  ) { }

  async execute(apartmentId: number): Promise<void> {
    const occupant = await this.residentRepository.findOccupantByApartmentId(apartmentId);

    if (!occupant || occupant.isOwner) {
      throw new NoActiveTenantToRevokeError();
    }

    // Tenant: deactivate entirely, mark as no longer occupying, set move-out date
    occupant.deactivate();
    occupant.markAsNonOccupant();
    occupant.updateMoveOutDate(new Date());
    await this.residentRepository.update(occupant);

    // Owner: resumes occupancy
    const owner = await this.residentRepository.findActiveByApartmentId(apartmentId);
    if (owner) {
      owner.markAsOccupant();
      await this.residentRepository.update(owner);
    }
  }
}