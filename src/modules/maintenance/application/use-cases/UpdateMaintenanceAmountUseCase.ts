import { MaintenanceSetting } from "../../domain/entities/MaintenanceSetting";
import { IMaintenanceSettingRepository } from "../../domain/repositories/IMaintenanceSettingRepository";
import { UpdateMaintenanceAmountDto } from "../dtos/UpdateMaintenanceAmountDto";

export class UpdateMaintenanceAmountUseCase {
  constructor(private readonly settingRepository: IMaintenanceSettingRepository) {}

  async execute(dto: UpdateMaintenanceAmountDto): Promise<MaintenanceSetting> {
    const existing = await this.settingRepository.get();

    if (existing) {
      existing.updateAmount(dto.amount);
      return this.settingRepository.createOrUpdate(existing);
    }

    const created = MaintenanceSetting.create(dto.amount);
    return this.settingRepository.createOrUpdate(created);
  }
}