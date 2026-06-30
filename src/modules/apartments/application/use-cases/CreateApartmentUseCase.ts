import { IApartmentRepository } from "../../domain/repositories/IApartmentRepository";
import { CreateApartmentDto } from "../dtos/CreateApartmentDto";
import { Apartment } from "../../domain/entities/Apartment";
import { ApartmentAlreadyExistsError } from "../../domain/errors/ApartmentErrors";

export class CreateApartmentUseCase {
  constructor(
    private readonly apartmentRepository: IApartmentRepository
  ) { }

  async execute(dto: CreateApartmentDto): Promise<Apartment> {
    // 1. Check unique block + floor + unit combination
    const existing = await this.apartmentRepository.findByBlockFloorAndUnit(
      dto.block,
      dto.floorNumber,
      dto.unitNumber
    );

    if (existing) {
      throw new ApartmentAlreadyExistsError();
    }

    // 2. Create apartment entity — flateNumber is computed automatically by the entity
    const apartmentInstance = Apartment.create({
      block: dto.block,
      floorNumber: dto.floorNumber,
      unitNumber: dto.unitNumber,
      areaSqft: dto.areaSqft,
      type: dto.type,
    });

    // 3. Save to DB
    return await this.apartmentRepository.create(apartmentInstance);
  }
}