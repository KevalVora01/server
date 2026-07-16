import { Vehicle } from "../../domain/entities/Vehicle";
import { IVehicleRepository } from "../../domain/repositories/IVehicleRepository";
import { IResidentRepository } from "../../../residents/domain/repositories/IResidentRepository";
import {
  ResidentNotFoundError,
  UnauthorizedVehicleAccessError,
} from "../../../residents/domain/errors/ResidentErrors";

export class ListApartmentVehiclesUseCase {
  constructor(
    private readonly vehicleRepository: IVehicleRepository,
    private readonly residentRepository: IResidentRepository,
  ) {}

  async execute(requestingResidentId: number): Promise<Vehicle[]> {
    const requestingResident = await this.residentRepository.findById(requestingResidentId);

    if (!requestingResident) {
      throw new ResidentNotFoundError();
    }

    if (!requestingResident.isOwner) {
      throw new UnauthorizedVehicleAccessError();
    }

    return this.vehicleRepository.findByApartmentId(requestingResident.apartmentId);
  }
}