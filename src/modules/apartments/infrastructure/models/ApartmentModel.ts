import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../../../shared/config/sequelize";
import { ApartmentType } from "../../domain/entities/Apartment";

interface ApartmentAttributes {
  id: number;
  block: string;
  floorNumber: number;
  unitNumber: string;
  areaSqft: number;
  type: ApartmentType;
  createdAt: Date;
  updatedAt: Date;
}

interface ApartmentCreationAttributes
  extends Optional<ApartmentAttributes, "id" | "createdAt" | "updatedAt"> { }

export class ApartmentModel
  extends Model<ApartmentAttributes, ApartmentCreationAttributes>
  implements ApartmentAttributes {
  declare id: number;
  declare block: string;
  declare floorNumber: number;
  declare unitNumber: string;
  declare areaSqft: number;
  declare type: ApartmentType;
  declare createdAt: Date;
  declare updatedAt: Date;
}

ApartmentModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    block: {
      type: DataTypes.STRING(1),
      allowNull: false,
    },
    floorNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    unitNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    areaSqft: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM(...Object.values(ApartmentType)),
      allowNull: false,
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
    tableName: "apartments",
    modelName: "Apartment",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ["block", "floor_number", "unit_number"],
      },
    ],
  }
);