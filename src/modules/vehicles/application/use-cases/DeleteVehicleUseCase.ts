import { IVehicleRepository } from "../../domain/repositories/IVehicleRepository";
import { VehicleNotFoundError, VehicleNotBelongsToResidentError } from "../../domain/errors/VehicleErrors";

export class DeleteVehicleUseCase {
  constructor(
    private readonly vehicleRepository: IVehicleRepository,
  ) { }

  async execute(id: number, residentId: number): Promise<void> {
    // 1. Check vehicle exists
    const vehicle = await this.vehicleRepository.findById(id);
    if (!vehicle) throw new VehicleNotFoundError();

    // 2. Check vehicle belongs to resident
    if (vehicle.residentId !== residentId) throw new VehicleNotBelongsToResidentError();

    // 3. Delete
    await this.vehicleRepository.delete(id);
  }
}