import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../../../shared/config/sequelize";
import { ComplaintPriority, ComplaintStatus } from "../../domain/entities/Complaint";
import { ResidentModel } from "../../../residents/infrastructure/models/ResidentModel";

interface ComplaintAttributes {
  id: number;
  residentId: number;
  title: string;
  description: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt: Date | null;
}

interface ComplaintCreationAttributes
  extends Optional<ComplaintAttributes, "id" | "status" | "createdAt" | "updatedAt" | "resolvedAt"> { }

export class ComplaintModel
  extends Model<ComplaintAttributes, ComplaintCreationAttributes>
  implements ComplaintAttributes {
  declare id: number;
  declare residentId: number;
  declare title: string;
  declare description: string;
  declare priority: ComplaintPriority;
  declare status: ComplaintStatus;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare resolvedAt: Date | null;
}

ComplaintModel.init(
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
    title: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    priority: {
      type: DataTypes.ENUM(...Object.values(ComplaintPriority)),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(ComplaintStatus)),
      allowNull: false,
      defaultValue: ComplaintStatus.OPEN,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    resolvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "complaints",
    modelName: "Complaint",
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ["resident_id"] },
      { fields: ["status"] },
      { fields: ["priority"] },
    ],
  }
);

ComplaintModel.belongsTo(ResidentModel, { foreignKey: "residentId", as: "resident" });
ResidentModel.hasMany(ComplaintModel, { foreignKey: "residentId", as: "complaints" });