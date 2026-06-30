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

    // 2. If block, floorNumber, or unitNumber changing — check uniqueness
    if (dto.block !== undefined || dto.floorNumber !== undefined || dto.unitNumber !== undefined) {
      const newBlock = dto.block ?? apartment.block;
      const newFloorNumber = dto.floorNumber ?? apartment.floorNumber;
      const newUnitNumber = dto.unitNumber ?? apartment.unitNumber;

      const existing = await this.apartmentRepository.findByBlockFloorAndUnit(
        newBlock,
        newFloorNumber,
        newUnitNumber
      );

      if (existing && existing.id !== id) {
        throw new ApartmentAlreadyExistsError();
      }
    }

    // 3. Update apartment using domain method — flateNumber recomputes automatically
    apartment.updateDetails({
      block: dto.block,
      floorNumber: dto.floorNumber,
      unitNumber: dto.unitNumber,
      areaSqft: dto.areaSqft,
      type: dto.type,
    });

    // 4. Save to DB
    return await this.apartmentRepository.update(apartment);
  }
}