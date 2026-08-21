import { Amenity } from "../../domain/entities/Amenity";
import { IAmenityRepository } from "../../domain/repositories/IAmenityRepository";

export class ListAmenitiesUseCase {
  constructor(private readonly amenityRepository: IAmenityRepository) {}

  async execute(activeOnly = false): Promise<Amenity[]> {
    return this.amenityRepository.findAll(activeOnly);
  }
}
