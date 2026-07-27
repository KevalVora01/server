import { IResidentRepository } from "../../domain/repositories/IResidentRepository";
import { Resident } from "../../domain/entities/Resident";

export class ListApartmentTenantsUseCase {
  constructor(
    private readonly residentRepository: IResidentRepository,
  ) { }

  async execute(apartmentId: number): Promise<Resident[]> {
    return this.residentRepository.findTenantsByApartmentId(apartmentId);
  }
}
