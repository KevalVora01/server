import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../../../shared/config/sequelize";
import { ApartmentModel } from "../../../apartments/infrastructure/models/ApartmentModel";
import { ResidentModel } from "../../../residents/infrastructure/models/ResidentModel";
import { UserModel } from "../../../auth/infrastructure/models/UserModel";
import { VisitorStatus } from "../../domain/entities/Visitor";

interface VisitorAttributes {
  id: number;
  apartmentId: number;
  residentId: number;
  name: string;
  phone: string;
  purpose: string;
  photoUrl: string | null;
  vehicleNumber: string | null;
  isPreRegistered: boolean;
  expectedAt: Date | null;
  status: VisitorStatus;
  approvalRequestedAt: Date | null;
  checkedInAt: Date | null;
  checkedOutAt: Date | null;
  loggedBySecurityId: number | null;
  createdAt: Date;
}

interface VisitorCreationAttributes
  extends Optional<VisitorAttributes, "id" | "photoUrl" | "vehicleNumber" | "expectedAt" | "status" | "approvalRequestedAt" | "checkedInAt" | "checkedOutAt" | "loggedBySecurityId" | "createdAt"> { }

export class VisitorModel
  extends Model<VisitorAttributes, VisitorCreationAttributes>
  implements VisitorAttributes {
  declare id: number;
  declare apartmentId: number;
  declare residentId: number;
  declare name: string;
  declare phone: string;
  declare purpose: string;
  declare photoUrl: string | null;
  declare vehicleNumber: string | null;
  declare isPreRegistered: boolean;
  declare expectedAt: Date | null;
  declare status: VisitorStatus;
  declare approvalRequestedAt: Date | null;
  declare checkedInAt: Date | null;
  declare checkedOutAt: Date | null;
  declare loggedBySecurityId: number | null;
  declare createdAt: Date;
}

VisitorModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    apartmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: ApartmentModel,
        key: "id",
      },
    },
    residentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: ResidentModel,
        key: "id",
      },
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    purpose: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    photoUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    vehicleNumber: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    isPreRegistered: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    expectedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(VisitorStatus)),
      allowNull: false,
      defaultValue: VisitorStatus.PENDING,
    },
    approvalRequestedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    checkedInAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    checkedOutAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    loggedBySecurityId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: UserModel,
        key: "id",
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "visitors",
    modelName: "Visitor",
    timestamps: true,
    updatedAt: false,
    underscored: true,
    indexes: [
      { fields: ["apartment_id"] },
      { fields: ["resident_id"] },
      { fields: ["status"] },
    ],
  }
);

VisitorModel.belongsTo(ApartmentModel, { foreignKey: "apartmentId", as: "apartment" });
VisitorModel.belongsTo(ResidentModel, { foreignKey: "residentId", as: "resident" });
VisitorModel.belongsTo(UserModel, { foreignKey: "loggedBySecurityId", as: "loggedBySecurity" });
ResidentModel.hasMany(VisitorModel, { foreignKey: "residentId", as: "visitors" });