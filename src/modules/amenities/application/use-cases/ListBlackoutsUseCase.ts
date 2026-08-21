import { Blackout } from "../../domain/entities/Blackout";
import { IBlackoutRepository } from "../../domain/repositories/IBlackoutRepository";

export class ListBlackoutsUseCase {
  constructor(private readonly blackoutRepository: IBlackoutRepository) {}

  async execute(amenityId: number): Promise<Blackout[]> {
    return this.blackoutRepository.findByAmenity(amenityId);
  }
}
