import { IApartmentRepository } from "../../domain/repositories/IApartmentRepository";
import { CreateApartmentDto } from "../dtos/CreateApartmentDto";
import { Apartment } from "../../domain/entities/Apartment";
import { ApartmentAlreadyExistsError } from "../../domain/errors/ApartmentErrors";

export class CreateApartmentUseCase {
  constructor(
    private readonly apartmentRepository: IApartmentRepository
  ) { }

  async execute(dto: CreateApartmentDto): Promise<Apartment> {
    // 1. Generate flateNumber from block + floorNumber + unitNumber
    const flateNumber = `${dto.block}-${dto.floorNumber}${dto.unitNumber.padStart(2, "0")}`;

    // 2. Check unique block + flateNumber combination
    const existing = await this.apartmentRepository.findByBlockAndFlateNumber(
      dto.block,
      flateNumber
    );

    if (existing) {
      throw new ApartmentAlreadyExistsError();
    }

    // 3. Create apartment entity
    const apartmentInstance = Apartment.create({
      block: dto.block,
      floorNumber: dto.floorNumber,
      unitNumber: dto.unitNumber,
      areaSqft: dto.areaSqft,
      type: dto.type,
    });

    // 4. Save to DB
    return await this.apartmentRepository.create(apartmentInstance);
  }
}