import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../../../shared/config/sequelize";

interface AmenityAttributes {
  id: number;
  name: string;
  description: string | null;
  capacity: number | null;
  operatingStart: string;
  operatingEnd: string;
  price: number;
  images: string[];
  isActive: boolean;
  createdAt: Date;
}

interface AmenityCreationAttributes
  extends Optional<AmenityAttributes, "id" | "createdAt" | "price" | "images"> {}

export class AmenityModel
  extends Model<AmenityAttributes, AmenityCreationAttributes>
  implements AmenityAttributes {
  declare id: number;
  declare name: string;
  declare description: string | null;
  declare capacity: number | null;
  declare operatingStart: string;
  declare operatingEnd: string;
  declare price: number;
  declare images: string[];
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
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      get() {
        const rawValue = this.getDataValue("price");
        return rawValue !== null && rawValue !== undefined ? parseFloat(String(rawValue)) : 0;
      },
    },
    images: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      get() {
        const raw = this.getDataValue("images");
        return Array.isArray(raw) ? raw : [];
      },
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
