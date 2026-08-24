import { Amenity } from "../../domain/entities/Amenity";
import { IAmenityRepository } from "../../domain/repositories/IAmenityRepository";
import { AmenityNotFoundError } from "../../domain/errors/BookingErrors";
import { UpdateAmenityDto } from "../dtos/UpdateAmenityDto";

export class UpdateAmenityUseCase {
  constructor(private readonly amenityRepository: IAmenityRepository) {}

  async execute(id: number, dto: UpdateAmenityDto): Promise<Amenity> {
    const amenity = await this.amenityRepository.findById(id);
    if (!amenity) throw new AmenityNotFoundError();

    if (dto.name !== undefined) amenity.name = dto.name;
    if (dto.description !== undefined) amenity.description = dto.description;
    if (dto.capacity !== undefined) amenity.capacity = dto.capacity;
    if (dto.operatingStart !== undefined) amenity.operatingStart = dto.operatingStart;
    if (dto.operatingEnd !== undefined) amenity.operatingEnd = dto.operatingEnd;
    if (dto.price !== undefined) amenity.price = Number(dto.price);
    if (dto.images !== undefined) {
      amenity.images = dto.images.filter(Boolean).slice(0, 5);
    }
    if (dto.isActive !== undefined) amenity.isActive = dto.isActive;

    return this.amenityRepository.update(amenity);
  }
}
