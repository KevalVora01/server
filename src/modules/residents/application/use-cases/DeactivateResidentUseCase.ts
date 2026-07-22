import { IResidentRepository } from "../../domain/repositories/IResidentRepository";
import { IUserRepository } from "../../../auth/domain/repositories/IUserRepository";
import { ResidentNotFoundError, ResidentAlreadyInactiveError } from "../../domain/errors/ResidentErrors";

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

    // 3. Prevent deactivating tenants directly
    if (!resident.isOwner) {
      throw new Error("Tenants cannot be deactivated directly from the Resident page.");
    }

    // 3. Deactivate both resident and linked user
    await this.residentRepository.deactivate(id);
    await this.userRepository.deactivate(resident.userId);
  }
}