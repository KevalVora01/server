import { Amenity } from "../../domain/entities/Amenity";
import { IAmenityRepository } from "../../domain/repositories/IAmenityRepository";
import { AmenityNotFoundError } from "../../domain/errors/BookingErrors";

export class DeactivateAmenityUseCase {
  constructor(private readonly amenityRepository: IAmenityRepository) {}

  async execute(id: number): Promise<Amenity> {
    const amenity = await this.amenityRepository.findById(id);
    if (!amenity) throw new AmenityNotFoundError();
    amenity.deactivate();
    return this.amenityRepository.update(amenity);
  }
}
