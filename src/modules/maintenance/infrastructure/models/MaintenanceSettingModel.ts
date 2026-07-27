import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../../../shared/config/sequelize";

interface MaintenanceSettingAttributes {
  id: number;
  amount: number;
  updatedAt: Date;
}

interface MaintenanceSettingCreationAttributes
  extends Optional<MaintenanceSettingAttributes, "id" | "updatedAt"> { }

export class MaintenanceSettingModel
  extends Model<MaintenanceSettingAttributes, MaintenanceSettingCreationAttributes>
  implements MaintenanceSettingAttributes {
  declare id: number;
  declare amount: number;
  declare updatedAt: Date;
}

MaintenanceSettingModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "maintenance_settings",
    modelName: "MaintenanceSetting",
    timestamps: true,
    createdAt: false,
    underscored: true,
  }
);