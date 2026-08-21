import { Op } from "sequelize";
import { IAmenityRepository } from "../../domain/repositories/IAmenityRepository";
import { Amenity } from "../../domain/entities/Amenity";
import { AmenityModel } from "../models/AmenityModel";

export class AmenityRepository implements IAmenityRepository {
  private toEntity(model: AmenityModel): Amenity {
    return new Amenity({
      id: model.id,
      name: model.name,
      description: model.description,
      capacity: model.capacity,
      operatingStart: model.operatingStart,
      operatingEnd: model.operatingEnd,
      isActive: model.isActive,
      createdAt: model.createdAt,
    });
  }

  async create(amenity: Amenity): Promise<Amenity> {
    const created = await AmenityModel.create({
      name: amenity.name,
      description: amenity.description,
      capacity: amenity.capacity,
      operatingStart: amenity.operatingStart,
      operatingEnd: amenity.operatingEnd,
      isActive: amenity.isActive,
    });
    return this.toEntity(created);
  }

  async findById(id: number): Promise<Amenity | null> {
    const model = await AmenityModel.findByPk(id);
    return model ? this.toEntity(model) : null;
  }

  async findAll(activeOnly?: boolean): Promise<Amenity[]> {
    const where: Record<string, unknown> = {};
    if (activeOnly) where.isActive = true;
    const rows = await AmenityModel.findAll({ where, order: [["name", "ASC"]] });
    return rows.map((row) => this.toEntity(row));
  }

  async update(amenity: Amenity): Promise<Amenity> {
    await AmenityModel.update(
      {
        name: amenity.name,
        description: amenity.description,
        capacity: amenity.capacity,
        operatingStart: amenity.operatingStart,
        operatingEnd: amenity.operatingEnd,
        isActive: amenity.isActive,
      },
      { where: { id: amenity.id } }
    );
    const updated = await AmenityModel.findByPk(amenity.id);
    return this.toEntity(updated!);
  }
}
