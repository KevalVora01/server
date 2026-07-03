import { IVehicleRepository } from "../../domain/repositories/IVehicleRepository";
import { UpdateVehicleDto } from "../dtos/UpdateVehicleDto";
import { Vehicle } from "../../domain/entities/Vehicle";
import { VehicleNotFoundError, VehicleNotBelongsToResidentError, VehiclePlateAlreadyExistsError } from "../../domain/errors/VehicleErrors";

export class UpdateVehicleUseCase {
  constructor(
    private readonly vehicleRepository: IVehicleRepository,
  ) {}

  async execute(id: number, residentId: number, dto: UpdateVehicleDto): Promise<Vehicle> {
    // 1. Check vehicle exists
    const vehicle = await this.vehicleRepository.findById(id);
    if (!vehicle) throw new VehicleNotFoundError();

    // 2. Check vehicle belongs to resident
    if (vehicle.residentId !== residentId) throw new VehicleNotBelongsToResidentError();

    // 3. Check plate number unique — only if changed
    if (dto.plateNumber && dto.plateNumber !== vehicle.plateNumber) {
      const existing = await this.vehicleRepository.findByPlateNumber(dto.plateNumber);
      if (existing) throw new VehiclePlateAlreadyExistsError();
    }

    // 4. Update fields
    if (dto.plateNumber !== undefined) vehicle.updatePlateNumber(dto.plateNumber);
    if (dto.type !== undefined) vehicle.updateType(dto.type);
    if (dto.brandName !== undefined) vehicle.updateBrandName(dto.brandName);
    if (dto.model !== undefined) vehicle.updateModel(dto.model);
    if (dto.color !== undefined) vehicle.updateColor(dto.color);
    if (dto.fuelType !== undefined) vehicle.updateFuelType(dto.fuelType);

    // 5. Save to DB
    return await this.vehicleRepository.update(vehicle);
  }
}