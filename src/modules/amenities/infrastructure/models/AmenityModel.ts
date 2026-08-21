import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../../../shared/config/sequelize";

interface AmenityAttributes {
  id: number;
  name: string;
  description: string | null;
  capacity: number | null;
  operatingStart: string;
  operatingEnd: string;
  isActive: boolean;
  createdAt: Date;
}

interface AmenityCreationAttributes
  extends Optional<AmenityAttributes, "id" | "createdAt"> {}

export class AmenityModel
  extends Model<AmenityAttributes, AmenityCreationAttributes>
  implements AmenityAttributes {
  declare id: number;
  declare name: string;
  declare description: string | null;
  declare capacity: number | null;
  declare operatingStart: string;
  declare operatingEnd: string;
  declare isActive: boolean;
  declare createdAt: Date;
}

AmenityModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    operatingStart: {
      type: DataTypes.STRING(8),
      allowNull: false,
    },
    operatingEnd: {
      type: DataTypes.STRING(8),
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
  },
  {
    sequelize,
    tableName: "amenities",
    modelName: "Amenity",
    timestamps: true,
    updatedAt: false,
    underscored: true,
    indexes: [{ fields: ["is_active"] }],
  }
);
