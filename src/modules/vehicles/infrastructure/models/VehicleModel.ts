import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../../../shared/config/sequelize";
import { ResidentModel } from "../../../residents/infrastructure/models/ResidentModel";
import { VehicleType, FuelType } from "../../domain/entities/Vehicle";

interface VehicleAttributes {
  id: number;
  residentId: number;
  plateNumber: string;
  type: VehicleType;
  brandName: string;
  model: string;
  color: string;
  fuelType: FuelType;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface VehicleCreationAttributes
  extends Optional<VehicleAttributes, "id" | "isActive" | "createdAt" | "updatedAt"> { }

export class VehicleModel
  extends Model<VehicleAttributes, VehicleCreationAttributes>
  implements VehicleAttributes {
  declare id: number;
  declare residentId: number;
  declare plateNumber: string;
  declare type: VehicleType;
  declare brandName: string;
  declare model: string;
  declare color: string;
  declare fuelType: FuelType;
  declare isActive: boolean;
  declare createdAt: Date;
  declare updatedAt: Date;
}

VehicleModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    residentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: ResidentModel,
        key: "id",
      },
    },
    plateNumber: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM(...Object.values(VehicleType)),
      allowNull: false,
    },
    brandName: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    model: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    color: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    fuelType: {
      type: DataTypes.ENUM(...Object.values(FuelType)),
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "vehicles",
    modelName: "Vehicle",
    timestamps: true,
    underscored: true,
    indexes: [
      { unique: true, fields: ["plate_number"] },
      { fields: ["resident_id"] },
    ],
  }
);

VehicleModel.belongsTo(ResidentModel, { foreignKey: "residentId", as: "resident" });
ResidentModel.hasMany(VehicleModel, { foreignKey: "residentId", as: "vehicles" });