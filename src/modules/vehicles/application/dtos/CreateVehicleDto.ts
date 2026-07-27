import { VehicleType, FuelType } from "../../domain/entities/Vehicle";

export interface CreateVehicleDto {
  residentId: number;
  plateNumber: string;
  type: VehicleType;
  brandName: string;
  model: string;
  color: string;
  fuelType: FuelType;
}