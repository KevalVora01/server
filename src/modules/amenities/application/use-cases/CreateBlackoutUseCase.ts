import { Blackout } from "../../domain/entities/Blackout";
import { IBlackoutRepository } from "../../domain/repositories/IBlackoutRepository";
import { IAmenityRepository } from "../../domain/repositories/IAmenityRepository";
import { CreateBlackoutDto } from "../dtos/CreateBlackoutDto";
import { AmenityNotFoundError } from "../../domain/errors/BookingErrors";

export class CreateBlackoutUseCase {
  constructor(
    private readonly blackoutRepository: IBlackoutRepository,
    private readonly amenityRepository: IAmenityRepository
  ) {}

  async execute(dto: CreateBlackoutDto): Promise<Blackout> {
    const amenity = await this.amenityRepository.findById(dto.amenityId);
    if (!amenity) throw new AmenityNotFoundError();

    const blackout = Blackout.create({
      amenityId: dto.amenityId,
      date: dto.date,
      startTime: dto.startTime,
      endTime: dto.endTime,
      reason: dto.reason,
      createdByAdminId: dto.createdByAdminId,
    });
    return this.blackoutRepository.create(blackout);
  }
}
