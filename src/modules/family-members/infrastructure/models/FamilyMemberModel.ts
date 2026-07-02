import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../../../shared/config/sequelize";
import { ResidentModel } from "../../../residents/infrastructure/models/ResidentModel";
import { FamilyRelation } from "../../domain/entities/FamilyMember";

interface FamilyMemberAttributes {
  id: number;
  residentId: number;
  name: string;
  relation: string;
  age: number | null;
  createdAt: Date;
  updatedAt: Date;
}

interface FamilyMemberCreationAttributes
  extends Optional<FamilyMemberAttributes, "id" | "age" | "createdAt" | "updatedAt"> { }

export class FamilyMemberModel
  extends Model<FamilyMemberAttributes, FamilyMemberCreationAttributes>
  implements FamilyMemberAttributes {
  declare id: number;
  declare residentId: number;
  declare name: string;
  declare relation: string;
  declare age: number | null;
  declare createdAt: Date;
  declare updatedAt: Date;
}

FamilyMemberModel.init(
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
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    relation: {
      type: DataTypes.ENUM(...Object.values(FamilyRelation)),
      allowNull: false,
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
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
    tableName: "family_members",
    modelName: "FamilyMember",
    timestamps: true,
    underscored: true,
  }
);

FamilyMemberModel.belongsTo(ResidentModel, { foreignKey: "residentId", as: "resident" });
ResidentModel.hasMany(FamilyMemberModel, { foreignKey: "residentId", as: "familyMembers" });