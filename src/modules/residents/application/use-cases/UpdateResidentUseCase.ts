import { IResidentRepository } from "../../domain/repositories/IResidentRepository";
import { IUserRepository } from "../../../auth/domain/repositories/IUserRepository";
import { UpdateResidentDto } from "../dtos/UpdateResidentDto";
import { Resident } from "../../domain/entities/Resident";
import { ResidentNotFoundError, ResidentAlreadyInactiveError } from "../../domain/errors/ResidentErrors";

export class UpdateResidentUseCase {
  constructor(
    private readonly residentRepository: IResidentRepository,
    private readonly userRepository: IUserRepository
  ) { }

  async execute(id: number, dto: UpdateResidentDto): Promise<Resident> {
    // 1. Check resident exists and is active
    const resident = await this.residentRepository.findById(id);
    if (!resident) {
      throw new ResidentNotFoundError();
    }
    if (!resident.isActive) {
      throw new ResidentAlreadyInactiveError();
    }

    // 2. Prevent editing tenants directly
    if (!resident.isOwner) {
      throw new Error("Tenants cannot be edited directly from the Resident page.");
    }

    // 2. Update user fields if provided
    if (dto.name !== undefined || dto.phone !== undefined) {
      const user = await this.userRepository.findById(resident.userId);
      if (!user) throw new ResidentNotFoundError();
      if (dto.name !== undefined) user.updateName(dto.name);
      if (dto.phone !== undefined) user.updatePhone(dto.phone);
      await this.userRepository.update(user);
    }

    // 3. Update resident fields if provided
    if (dto.isOwner !== undefined) resident.updateIsOwner(dto.isOwner);
    if (dto.moveOutDate) resident.updateMoveOutDate(dto.moveOutDate);

    // 4. If moveOutDate is set — deactivate resident and user
    if (dto.moveOutDate) {
      resident.deactivate();
      await this.userRepository.deactivate(resident.userId);
    }

    return await this.residentRepository.update(resident);
  }
}