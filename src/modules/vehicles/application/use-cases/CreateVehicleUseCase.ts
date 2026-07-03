import { IVehicleRepository } from "../../domain/repositories/IVehicleRepository";
import { IResidentRepository } from "../../../residents/domain/repositories/IResidentRepository";
import { CreateVehicleDto } from "../dtos/CreateVehicleDto";
import { Vehicle } from "../../domain/entities/Vehicle";
import { VehiclePlateAlreadyExistsError } from "../../domain/errors/VehicleErrors";
import { ResidentNotFoundError } from "../../../residents/domain/errors/ResidentErrors";

export class CreateVehicleUseCase {
  constructor(
    private readonly vehicleRepository: IVehicleRepository,
    private readonly residentRepository: IResidentRepository,
  ) {}

  async execute(dto: CreateVehicleDto): Promise<Vehicle> {
    // 1. Check resident exists
    const resident = await this.residentRepository.findById(dto.residentId);
    if (!resident) throw new ResidentNotFoundError();

    // 2. Check plate number is unique
    const existing = await this.vehicleRepository.findByPlateNumber(dto.plateNumber);
    if (existing) throw new VehiclePlateAlreadyExistsError();

    // 3. Create vehicle entity
    const vehicle = Vehicle.create({
      residentId: dto.residentId,
      plateNumber: dto.plateNumber,
      type: dto.type,
      brandName: dto.brandName,
      model: dto.model,
      color: dto.color,
      fuelType: dto.fuelType,
    });

    // 4. Save to DB
    return await this.vehicleRepository.create(vehicle);
  }
}