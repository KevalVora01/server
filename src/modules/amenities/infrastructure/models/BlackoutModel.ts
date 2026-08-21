import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../../../shared/config/sequelize";
import { AmenityModel } from "./AmenityModel";

interface BlackoutAttributes {
  id: number;
  amenityId: number;
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
  createdByAdminId: number;
  createdAt: Date;
}

interface BlackoutCreationAttributes
  extends Optional<BlackoutAttributes, "id" | "createdAt"> {}

export class BlackoutModel
  extends Model<BlackoutAttributes, BlackoutCreationAttributes>
  implements BlackoutAttributes {
  declare id: number;
  declare amenityId: number;
  declare date: string;
  declare startTime: string;
  declare endTime: string;
  declare reason: string;
  declare createdByAdminId: number;
  declare createdAt: Date;
}

BlackoutModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    amenityId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: AmenityModel, key: "id" },
    },
    date: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    startTime: {
      type: DataTypes.STRING(8),
      allowNull: false,
    },
    endTime: {
      type: DataTypes.STRING(8),
      allowNull: false,
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    createdByAdminId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "blackouts",
    modelName: "Blackout",
    timestamps: true,
    updatedAt: false,
    underscored: true,
    indexes: [
      { fields: ["amenity_id"] },
      { fields: ["date"] },
    ],
  }
);

BlackoutModel.belongsTo(AmenityModel, { foreignKey: "amenityId", as: "amenity" });
