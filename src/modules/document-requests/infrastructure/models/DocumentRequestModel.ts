import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../../../shared/config/sequelize";
import { ApartmentModel } from "../../../apartments/infrastructure/models/ApartmentModel";
import { ResidentModel } from "../../../residents/infrastructure/models/ResidentModel";

export enum DocumentRequestStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  UPLOADED = "UPLOADED",
  REJECTED = "REJECTED",
}

export enum RequestRole {
  TENANT = "TENANT",
  OWNER = "OWNER",
  ADMIN = "ADMIN",
}

export interface DocumentRequestAttributes {
  id: number;
  apartmentId: number;
  requesterId: number;
  requesterRole: RequestRole;
  targetId: number | null;
  targetRole: RequestRole;
  documentType: string;
  customDocumentName: string | null;
  note: string | null;
  status: DocumentRequestStatus;
  documentUrl: string | null;
  documentFileName: string | null;
  rejectionReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentRequestCreationAttributes
  extends Optional<
    DocumentRequestAttributes,
    | "id"
    | "targetId"
    | "customDocumentName"
    | "note"
    | "status"
    | "documentUrl"
    | "documentFileName"
    | "rejectionReason"
    | "createdAt"
    | "updatedAt"
  > {}

export class DocumentRequestModel
  extends Model<DocumentRequestAttributes, DocumentRequestCreationAttributes>
  implements DocumentRequestAttributes {
  declare id: number;
  declare apartmentId: number;
  declare requesterId: number;
  declare requesterRole: RequestRole;
  declare targetId: number | null;
  declare targetRole: RequestRole;
  declare documentType: string;
  declare customDocumentName: string | null;
  declare note: string | null;
  declare status: DocumentRequestStatus;
  declare documentUrl: string | null;
  declare documentFileName: string | null;
  declare rejectionReason: string | null;
  declare createdAt: Date;
  declare updatedAt: Date;
}

DocumentRequestModel.init(
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
    requesterId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: ResidentModel,
        key: "id",
      },
    },
    requesterRole: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: RequestRole.TENANT,
    },
    targetId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: ResidentModel,
        key: "id",
      },
    },
    targetRole: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: RequestRole.OWNER,
    },
    documentType: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    customDocumentName: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: DocumentRequestStatus.PENDING,
    },
    documentUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    documentFileName: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    tableName: "document_requests",
    modelName: "DocumentRequest",
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ["apartment_id"] },
      { fields: ["requester_id"] },
      { fields: ["target_id"] },
      { fields: ["status"] },
    ],
  }
);

DocumentRequestModel.belongsTo(ApartmentModel, { foreignKey: "apartmentId", as: "apartment" });
DocumentRequestModel.belongsTo(ResidentModel, { foreignKey: "requesterId", as: "requester" });
DocumentRequestModel.belongsTo(ResidentModel, { foreignKey: "targetId", as: "target" });
