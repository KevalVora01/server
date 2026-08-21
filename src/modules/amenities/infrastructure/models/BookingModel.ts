import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../../../shared/config/sequelize";
import { AmenityModel } from "./AmenityModel";
import { ResidentModel } from "../../../residents/infrastructure/models/ResidentModel";
import { ApartmentModel } from "../../../apartments/infrastructure/models/ApartmentModel";

interface BookingAttributes {
  id: number;
  amenityId: number;
  apartmentId: number;
  residentId: number;
  bookingDate: string;
  startTime: string;
  endTime: string;
  purpose: string | null;
  status: "Pending" | "Confirmed" | "Rejected" | "Cancelled";
  rejectionReason: string | null;
  cancellationReason: string | null;
  approvedBySecurityId: number | null;
  paidAt: Date | null;
  paymentRef: string | null;
  createdAt: Date;
}

interface BookingCreationAttributes
  extends Optional<BookingAttributes, "id" | "createdAt" | "paidAt" | "paymentRef"> {}

export class BookingModel
  extends Model<BookingAttributes, BookingCreationAttributes>
  implements BookingAttributes {
  declare id: number;
  declare amenityId: number;
  declare apartmentId: number;
  declare residentId: number;
  declare bookingDate: string;
  declare startTime: string;
  declare endTime: string;
  declare purpose: string | null;
  declare status: "Pending" | "Confirmed" | "Rejected" | "Cancelled";
  declare rejectionReason: string | null;
  declare cancellationReason: string | null;
  declare approvedBySecurityId: number | null;
  declare paidAt: Date | null;
  declare paymentRef: string | null;
  declare createdAt: Date;
}

BookingModel.init(
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
    apartmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: ApartmentModel, key: "id" },
    },
    residentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: ResidentModel, key: "id" },
    },
    bookingDate: {
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
    purpose: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("Pending", "Confirmed", "Rejected", "Cancelled"),
      allowNull: false,
      defaultValue: "Pending",
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    cancellationReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    approvedBySecurityId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    paidAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    paymentRef: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "bookings",
    modelName: "Booking",
    timestamps: true,
    updatedAt: false,
    underscored: true,
    indexes: [
      { fields: ["amenity_id"] },
      { fields: ["resident_id"] },
      { fields: ["apartment_id"] },
      { fields: ["booking_date"] },
      { fields: ["status"] },
    ],
  }
);

BookingModel.belongsTo(AmenityModel, { foreignKey: "amenityId", as: "amenity" });
BookingModel.belongsTo(ResidentModel, { foreignKey: "residentId", as: "resident" });
BookingModel.belongsTo(ApartmentModel, { foreignKey: "apartmentId", as: "apartment" });
