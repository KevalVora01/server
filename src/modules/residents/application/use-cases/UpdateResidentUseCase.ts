import { IResidentRepository } from "../../domain/repositories/IResidentRepository";
import { IUserRepository } from "../../../auth/domain/repositories/IUserRepository";
import { UpdateResidentDto } from "../dtos/UpdateResidentDto";
import { Resident } from "../../domain/entities/Resident";
import { ResidentNotFoundError, ResidentAlreadyInactiveError } from "../../domain/errors/ResidentErrors";

export class UpdateResidentUseCase {
  constructor(
    private readonly residentRepository: IResidentRepository,
    private readonly userRepository: IUserRepository
  ) {}

  async execute(id: number, dto: UpdateResidentDto): Promise<Resident> {
    // 1. Check resident exists and is active
    const resident = await this.residentRepository.findById(id);
    if (!resident) {
      throw new ResidentNotFoundError();
    }
    if (!resident.isActive) {
      throw new ResidentAlreadyInactiveError();
    }

    // 2. Update user fields if provided
    if (dto.name || dto.phone) {
      const user = await this.userRepository.findById(resident.userId);
      if (user) {
        if (dto.name) user.updateName(dto.name);
        if (dto.phone) user.updatePhone(dto.phone);
        await this.userRepository.update(user);
      }
    }

    // 3. Update resident fields if provided
    if (dto.apartmentId) resident.updateApartment(dto.apartmentId);
    if (dto.isOwner !== undefined) resident.updateIsOwner(dto.isOwner);
    if (dto.moveOutDate) resident.updateMoveOutDate(dto.moveOutDate);

    const updatedResident = await this.residentRepository.update(resident);

    return updatedResident;
  }
}