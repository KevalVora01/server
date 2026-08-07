import { Vehicle } from "../entities/Vehicle";

export interface IVehicleRepository {
  create(vehicle: Vehicle): Promise<Vehicle>;
  findById(id: number): Promise<Vehicle | null>;
  findByPlateNumber(plateNumber: string): Promise<Vehicle | null>;
  findByResidentId(residentId: number): Promise<Vehicle[]>;
  update(vehicle: Vehicle): Promise<Vehicle>;
  delete(id: number): Promise<void>;
}