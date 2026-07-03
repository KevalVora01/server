import { IVehicleRepository } from "../../domain/repositories/IVehicleRepository";
import { Vehicle, VehicleType, FuelType } from "../../domain/entities/Vehicle";
import { VehicleModel } from "../models/VehicleModel";

export class VehicleRepository implements IVehicleRepository {

  private toEntity(model: VehicleModel): Vehicle {
    return new Vehicle({
      id: model.id,
      residentId: model.residentId,
      plateNumber: model.plateNumber,
      type: model.type as VehicleType,
      brandName: model.brandName,
      model: model.model,
      color: model.color,
      fuelType: model.fuelType as FuelType,
      isActive: model.isActive,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }

  async create(vehicle: Vehicle): Promise<Vehicle> {
    const created = await VehicleModel.create({
      residentId: vehicle.residentId,
      plateNumber: vehicle.plateNumber,
      type: vehicle.type,
      brandName: vehicle.brandName,
      model: vehicle.model,
      color: vehicle.color,
      fuelType: vehicle.fuelType,
      isActive: vehicle.isActive,
    });

    return this.toEntity(created);
  }

  async findById(id: number): Promise<Vehicle | null> {
    const model = await VehicleModel.findByPk(id);
    if (!model) return null;
    return this.toEntity(model);
  }

  async findByPlateNumber(plateNumber: string): Promise<Vehicle | null> {
    const model = await VehicleModel.findOne({ where: { plateNumber } });
    if (!model) return null;
    return this.toEntity(model);
  }

  async findByResidentId(residentId: number): Promise<Vehicle[]> {
    const models = await VehicleModel.findAll({
      where: { residentId },
      order: [["createdAt", "ASC"]],
    });
    return models.map((model) => this.toEntity(model));
  }

  async update(vehicle: Vehicle): Promise<Vehicle> {
    await VehicleModel.update(
      {
        plateNumber: vehicle.plateNumber,
        type: vehicle.type,
        brandName: vehicle.brandName,
        model: vehicle.model,
        color: vehicle.color,
        fuelType: vehicle.fuelType,
        isActive: vehicle.isActive,
      },
      { where: { id: vehicle.id } }
    );

    const updated = await VehicleModel.findByPk(vehicle.id);
    return this.toEntity(updated!);
  }

  async delete(id: number): Promise<void> {
    await VehicleModel.destroy({ where: { id } });
  }
}