import { IVehicleRepository } from "../../domain/repositories/IVehicleRepository";
import { IResidentRepository } from "../../../residents/domain/repositories/IResidentRepository";
import { Vehicle } from "../../domain/entities/Vehicle";
import { ResidentNotFoundError } from "../../../residents/domain/errors/ResidentErrors";

export class GetVehiclesUseCase {
  constructor(
    private readonly vehicleRepository: IVehicleRepository,
    private readonly residentRepository: IResidentRepository,
  ) { }

  async execute(residentId: number): Promise<Vehicle[]> {
    // 1. Check resident exists
    const resident = await this.residentRepository.findById(residentId);
    if (!resident) throw new ResidentNotFoundError();

    // 2. Get vehicles
    return await this.vehicleRepository.findByResidentId(residentId);
  }
}