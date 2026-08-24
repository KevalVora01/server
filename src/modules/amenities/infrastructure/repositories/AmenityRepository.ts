import { Op } from "sequelize";
import { IAmenityRepository } from "../../domain/repositories/IAmenityRepository";
import { Amenity } from "../../domain/entities/Amenity";
import { AmenityModel } from "../models/AmenityModel";

export class AmenityRepository implements IAmenityRepository {
  private toEntity(model: AmenityModel): Amenity {
    let images: string[] = [];
    const rawImages: unknown = model.images ?? (model as unknown as Record<string, unknown>).images;
    if (Array.isArray(rawImages)) {
      images = rawImages.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
    } else if (typeof rawImages === "string") {
      const trimmed = rawImages.trim();
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          images = parsed.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
        } else if (trimmed) {
          images = [trimmed];
        }
      } catch {
        if (trimmed) images = [trimmed];
      }
    }

    return new Amenity({
      id: model.id,
      name: model.name,
      description: model.description,
      capacity: model.capacity,
      operatingStart: model.operatingStart,
      operatingEnd: model.operatingEnd,
      price: Number(model.price) || 0,
      images,
      bookingType: model.bookingType || "EXCLUSIVE",
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
      price: amenity.price,
      images: amenity.images || [],
      bookingType: amenity.bookingType,
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
        price: amenity.price,
        images: amenity.images || [],
        bookingType: amenity.bookingType,
        isActive: amenity.isActive,
      },
      { where: { id: amenity.id } }
    );
    const updated = await AmenityModel.findByPk(amenity.id);
    return this.toEntity(updated!);
  }
}
