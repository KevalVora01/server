import { IBlackoutRepository } from "../../domain/repositories/IBlackoutRepository";
import { Blackout } from "../../domain/entities/Blackout";
import { BlackoutModel } from "../models/BlackoutModel";

export class BlackoutRepository implements IBlackoutRepository {
  private toEntity(model: BlackoutModel): Blackout {
    return new Blackout({
      id: model.id,
      amenityId: model.amenityId,
      date: model.date,
      startTime: model.startTime,
      endTime: model.endTime,
      reason: model.reason,
      createdByAdminId: model.createdByAdminId,
      createdAt: model.createdAt,
    });
  }

  async create(blackout: Blackout): Promise<Blackout> {
    const created = await BlackoutModel.create({
      amenityId: blackout.amenityId,
      date: blackout.date,
      startTime: blackout.startTime,
      endTime: blackout.endTime,
      reason: blackout.reason,
      createdByAdminId: blackout.createdByAdminId,
    });
    return this.toEntity(created);
  }

  async findById(id: number): Promise<Blackout | null> {
    const model = await BlackoutModel.findByPk(id);
    return model ? this.toEntity(model) : null;
  }

  async findByAmenityAndDate(amenityId: number, date: string): Promise<Blackout[]> {
    const rows = await BlackoutModel.findAll({
      where: { amenityId, date },
      order: [["startTime", "ASC"]],
    });
    return rows.map((row) => this.toEntity(row));
  }

  async findByAmenity(amenityId: number): Promise<Blackout[]> {
    const rows = await BlackoutModel.findAll({
      where: { amenityId },
      order: [["date", "ASC"], ["startTime", "ASC"]],
    });
    return rows.map((row) => this.toEntity(row));
  }

  async delete(id: number): Promise<void> {
    await BlackoutModel.destroy({ where: { id } });
  }
}
