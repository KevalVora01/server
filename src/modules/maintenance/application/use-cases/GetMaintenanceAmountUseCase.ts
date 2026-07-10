import { MaintenanceSetting } from "../../domain/entities/MaintenanceSetting";
import { IMaintenanceSettingRepository } from "../../domain/repositories/IMaintenanceSettingRepository";
import { MaintenanceSettingNotFoundError } from "../../domain/errors/MaintenanceErrors";

export class GetMaintenanceAmountUseCase {
  constructor(private readonly settingRepository: IMaintenanceSettingRepository) { }

  async execute(): Promise<MaintenanceSetting> {
    const setting = await this.settingRepository.get();

    if (!setting) {
      throw new MaintenanceSettingNotFoundError();
    }

    return setting;
  }
}