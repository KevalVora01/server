import { IMaintenanceSettingRepository } from "../../domain/repositories/IMaintenanceSettingRepository";
import { MaintenanceSetting } from "../../domain/entities/MaintenanceSetting";
import { MaintenanceSettingModel } from "../models/MaintenanceSettingModel";

export class MaintenanceSettingRepository implements IMaintenanceSettingRepository {

  private toEntity(model: MaintenanceSettingModel): MaintenanceSetting {
    return new MaintenanceSetting({
      id: model.id,
      amount: Number(model.amount),
      updatedAt: model.updatedAt,
    });
  }

  async get(): Promise<MaintenanceSetting | null> {
    const model = await MaintenanceSettingModel.findOne();

    if (!model) return null;

    return this.toEntity(model);
  }

  async createOrUpdate(setting: MaintenanceSetting): Promise<MaintenanceSetting> {
    if (setting.id) {
      await MaintenanceSettingModel.update(
        { amount: setting.amount, updatedAt: setting.updatedAt },
        { where: { id: setting.id } }
      );
      const updated = await MaintenanceSettingModel.findByPk(setting.id);
      return this.toEntity(updated!);
    }

    const created = await MaintenanceSettingModel.create({
      amount: setting.amount,
    });

    return this.toEntity(created);
  }
}