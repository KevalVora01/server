import { IApartmentRepository } from "../../domain/repositories/IApartmentRepository";
import { UpdateApartmentDto } from "../dtos/UpdateApartmentDto";
import { Apartment } from "../../domain/entities/Apartment";
import { ApartmentNotFoundError, ApartmentAlreadyExistsError } from "../../domain/errors/ApartmentErrors";

export class UpdateApartmentUseCase {
  constructor(
    private readonly apartmentRepository: IApartmentRepository
  ) { }

  async execute(id: number, dto: UpdateApartmentDto): Promise<Apartment> {
    // 1. Check apartment exists
    const apartment = await this.apartmentRepository.findById(id);
    if (!apartment) {
      throw new ApartmentNotFoundError();
    }

    // 2. Determine new block/floorNumber/unitNumber and regenerate flateNumber if any changed
    const newBlock = dto.block ?? apartment.block;
    const newFloorNumber = dto.floorNumber ?? apartment.floorNumber;

    let newFlateNumber = apartment.flateNumber;
    if (dto.block !== undefined || dto.floorNumber !== undefined || dto.unitNumber !== undefined) {
      const newUnitNumber = dto.unitNumber ?? this.extractUnitNumber(apartment);
      newFlateNumber = `${newBlock}-${newFloorNumber}${newUnitNumber.padStart(2, "0")}`;
    }

    // 3. If block or flateNumber changing check uniqueness
    if (newBlock !== apartment.block || newFlateNumber !== apartment.flateNumber) {
      const existing = await this.apartmentRepository.findByBlockAndFlateNumber(
        newBlock,
        newFlateNumber
      );

      if (existing && existing.id !== id) {
        throw new ApartmentAlreadyExistsError();
      }
    }

    // 4. Update apartment using domain method
    apartment.updateDetails({
      block: dto.block,
      floorNumber: dto.floorNumber,
      flateNumber: newFlateNumber,
      areaSqft: dto.areaSqft,
      type: dto.type,
    });

    // 5. Save to DB
    return await this.apartmentRepository.update(apartment);
  }

  private extractUnitNumber(apartment: Apartment): string {
    const prefix = `${apartment.block}-${apartment.floorNumber}`;
    return apartment.flateNumber.startsWith(prefix)
      ? apartment.flateNumber.slice(prefix.length)
      : "";
  }
}