import { IApartmentRepository } from "../../domain/repositories/IApartmentRepository";
import { UpdateApartmentDto } from "../dtos/UpdateApartmentDto";
import { Apartment } from "../../domain/entities/Apartment";
import { ApartmentNotFoundError, ApartmentAlreadyExistsError } from "../../domain/errors/ApartmentErrors";

export class UpdateApartmentUseCase {
  constructor(
    private readonly apartmentRepository: IApartmentRepository
  ) {}

  async execute(id: number, dto: UpdateApartmentDto): Promise<Apartment> {
    // 1. Check apartment exists
    const apartment = await this.apartmentRepository.findById(id);
    if (!apartment) {
      throw new ApartmentNotFoundError();
    }

    // 2. If block or flateNumber changing check uniqueness
    if (dto.block !== undefined || dto.flateNumber !== undefined) {
      const newBlock = dto.block ?? apartment.block;
      const newFlateNumber = dto.flateNumber ?? apartment.flateNumber;

      const existing = await this.apartmentRepository.findByBlockAndFlateNumber(
        newBlock,
        newFlateNumber
      );

      if (existing && existing.id !== id) {
        throw new ApartmentAlreadyExistsError();
      }
    }

    // 3. Update apartment using domain method
    apartment.updateDetails({
      block: dto.block,
      floorNumber: dto.floorNumber,
      flateNumber: dto.flateNumber,
      areaSqft: dto.areaSqft,
      type: dto.type,
    });

    // 4. Save to DB
    return await this.apartmentRepository.update(apartment);
  }
}