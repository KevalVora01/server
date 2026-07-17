import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../../../shared/config/sequelize";
import { InvoiceStatus, ExtraCharge } from "../../domain/entities/Invoice";
import { ApartmentModel } from "../../../apartments/infrastructure/models/ApartmentModel";
import { ResidentModel } from "../../../residents/infrastructure/models/ResidentModel";

interface InvoiceAttributes {
  id: number;
  apartmentId: number;
  residentId: number | null;
  month: number;
  year: number;
  baseAmount: number;
  extraCharges: ExtraCharge[];
  totalAmount: number;
  status: InvoiceStatus;
  dueDate: Date;
  paidAt: Date | null;
  paymentRef: string | null;
  pdfUrl: string | null;
  createdAt: Date;
}

interface InvoiceCreationAttributes
  extends Optional<InvoiceAttributes, "id" | "extraCharges" | "status" | "paidAt" | "paymentRef" | "pdfUrl" | "createdAt"> { }

export class InvoiceModel
  extends Model<InvoiceAttributes, InvoiceCreationAttributes>
  implements InvoiceAttributes {
  declare id: number;
  declare apartmentId: number;
  declare residentId: number | null;
  declare month: number;
  declare year: number;
  declare baseAmount: number;
  declare extraCharges: ExtraCharge[];
  declare totalAmount: number;
  declare status: InvoiceStatus;
  declare dueDate: Date;
  declare paidAt: Date | null;
  declare paymentRef: string | null;
  declare pdfUrl: string | null;
  declare createdAt: Date;

  declare resident?: ResidentModel;
  declare apartment?: ApartmentModel;
}

InvoiceModel.init(
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
      allowNull: true,
      references: {
        model: ResidentModel,
        key: "id",
      },
    },
    month: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 12 },
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    baseAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    extraCharges: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(InvoiceStatus)),
      allowNull: false,
      defaultValue: InvoiceStatus.PENDING,
    },
    dueDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    paidAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    paymentRef: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    pdfUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "invoices",
    modelName: "Invoice",
    timestamps: true,
    updatedAt: false,
    underscored: true,
    indexes: [
      { fields: ["apartment_id"] },
      { fields: ["resident_id"] },
      { fields: ["status"] },
      { fields: ["month", "year"], name: "idx_invoice_period" },
    ],
  }
);

InvoiceModel.belongsTo(ResidentModel, { foreignKey: "residentId", as: "resident" });
InvoiceModel.belongsTo(ApartmentModel, { foreignKey: "apartmentId", as: "apartment" });
ResidentModel.hasMany(InvoiceModel, { foreignKey: "residentId", as: "invoices" });