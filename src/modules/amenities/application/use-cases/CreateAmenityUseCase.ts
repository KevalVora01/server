import { Amenity } from "../../domain/entities/Amenity";
import { IAmenityRepository } from "../../domain/repositories/IAmenityRepository";
import { CreateAmenityDto } from "../dtos/CreateAmenityDto";

export class CreateAmenityUseCase {
  constructor(private readonly amenityRepository: IAmenityRepository) {}

  async execute(dto: CreateAmenityDto): Promise<Amenity> {
    const amenity = Amenity.create({
      name: dto.name,
      description: dto.description ?? null,
      capacity: dto.capacity ?? null,
      operatingStart: dto.operatingStart,
      operatingEnd: dto.operatingEnd,
      isActive: dto.isActive ?? true,
    });
    return this.amenityRepository.create(amenity);
  }
}
