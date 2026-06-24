import { IApartmentRepository } from "../../domain/repositories/IApartmentRepository";
import { Apartment } from "../../domain/entities/Apartment";
import { ApartmentNotFoundError } from "../../domain/errors/ApartmentErrors";

export class GetApartmentUseCase {
  constructor(
    private readonly apartmentRepository: IApartmentRepository
  ) {}

  async execute(id: number): Promise<Apartment> {
    const apartment = await this.apartmentRepository.findById(id);

    if (!apartment) {
      throw new ApartmentNotFoundError();
    }

    return apartment;
  }
}