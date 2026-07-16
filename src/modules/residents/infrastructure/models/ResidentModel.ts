import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../../../shared/config/sequelize";
import { UserModel } from "../../../auth/infrastructure/models/UserModel";
import { ApartmentModel } from "../../../apartments/infrastructure/models/ApartmentModel";

interface ResidentAttributes {
  id: number;
  userId: number;
  apartmentId: number;
  isOwner: boolean;
  isCommitteeMember: boolean;
  isOccupant: boolean;
  moveInDate: Date;
  moveOutDate: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ResidentCreationAttributes
  extends Optional<ResidentAttributes, "id" | "isCommitteeMember" | "isOccupant" | "moveOutDate" | "isActive" | "createdAt" | "updatedAt"> { }

export class ResidentModel
  extends Model<ResidentAttributes, ResidentCreationAttributes>
  implements ResidentAttributes {
  declare id: number;
  declare userId: number;
  declare apartmentId: number;
  declare isOwner: boolean;
  declare isCommitteeMember: boolean;
  declare isOccupant: boolean;
  declare moveInDate: Date;
  declare moveOutDate: Date | null;
  declare isActive: boolean;
  declare createdAt: Date;
  declare updatedAt: Date;
}

ResidentModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: UserModel,
        key: "id",
      },
    },
    apartmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: ApartmentModel,
        key: "id",
      },
    },
    isOwner: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    isCommitteeMember: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    isOccupant: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    moveInDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    moveOutDate: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
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
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "residents",
    modelName: "Resident",
    timestamps: true,
    underscored: true,
  }
);

ResidentModel.belongsTo(UserModel, { foreignKey: "userId", as: "user" });
UserModel.hasOne(ResidentModel, { foreignKey: "userId", as: "resident" });

ResidentModel.belongsTo(ApartmentModel, { foreignKey: "apartmentId", as: "apartment" });
ApartmentModel.hasMany(ResidentModel, { foreignKey: "apartmentId", as: "residents" });