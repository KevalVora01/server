import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../../../shared/config/sequelize";
import { ApartmentModel } from "../../../apartments/infrastructure/models/ApartmentModel";
import { TenantRequestStatus } from "../../domain/entities/TenantRequest";
import { ResidentModel } from "../../../residents/infrastructure/models/ResidentModel";

interface TenantRequestAttributes {
  id: number;
  apartmentId: number;
  requestedBy: number;
  tenantName: string;
  tenantEmail: string;
  tenantPhone: string;
  moveInDate: Date;
  status: TenantRequestStatus;
  createdAt: Date;
  decidedAt: Date | null;
}

interface TenantRequestCreationAttributes
  extends Optional<TenantRequestAttributes, "id" | "status" | "createdAt" | "decidedAt"> { }

export class TenantRequestModel
  extends Model<TenantRequestAttributes, TenantRequestCreationAttributes>
  implements TenantRequestAttributes {
  declare id: number;
  declare apartmentId: number;
  declare requestedBy: number;
  declare tenantName: string;
  declare tenantEmail: string;
  declare tenantPhone: string;
  declare moveInDate: Date;
  declare status: TenantRequestStatus;
  declare createdAt: Date;
  declare decidedAt: Date | null;
}

TenantRequestModel.init(
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
    requestedBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: ResidentModel,
        key: "id",
      },
    },
    tenantName: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    tenantEmail: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    tenantPhone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    moveInDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(TenantRequestStatus)),
      allowNull: false,
      defaultValue: TenantRequestStatus.PENDING,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    decidedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    sequelize,
    tableName: "tenant_requests",
    modelName: "TenantRequest",
    timestamps: true,
    updatedAt: false,
    underscored: true,
    indexes: [
      { fields: ["apartment_id"] },
      { fields: ["status"] },
    ],
  }
);

TenantRequestModel.belongsTo(ApartmentModel, { foreignKey: "apartmentId", as: "apartment" });
TenantRequestModel.belongsTo(ResidentModel, { foreignKey: "requestedBy", as: "owner" });