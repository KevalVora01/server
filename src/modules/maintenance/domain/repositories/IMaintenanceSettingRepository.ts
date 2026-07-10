import { MaintenanceSetting } from "../entities/MaintenanceSetting";

export interface IMaintenanceSettingRepository {
  get(): Promise<MaintenanceSetting | null>;
  createOrUpdate(setting: MaintenanceSetting): Promise<MaintenanceSetting>;
}