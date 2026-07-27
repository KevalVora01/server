import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../../../shared/config/sequelize";
import { UserModel } from "../../../auth/infrastructure/models/UserModel";
import { NoticeCategory } from "../../domain/entities/Notice";

interface NoticeAttributes {
  id: number;
  adminId: number;
  title: string;
  body: string;
  category: NoticeCategory;
  isPinned: boolean;
  isActive: boolean;
  publishedAt: Date;
  updatedAt: Date;
}

interface NoticeCreationAttributes
  extends Optional<NoticeAttributes, "id" | "isPinned" | "isActive" | "publishedAt" | "updatedAt"> { }

export class NoticeModel
  extends Model<NoticeAttributes, NoticeCreationAttributes>
  implements NoticeAttributes {
  declare id: number;
  declare adminId: number;
  declare title: string;
  declare body: string;
  declare category: NoticeCategory;
  declare isPinned: boolean;
  declare isActive: boolean;
  declare publishedAt: Date;
  declare updatedAt: Date;
}

NoticeModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    adminId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: UserModel,
        key: "id",
      },
    },
    title: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    category: {
      type: DataTypes.ENUM(...Object.values(NoticeCategory)),
      allowNull: false,
    },
    isPinned: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    publishedAt: {
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
    tableName: "notices",
    modelName: "Notice",
    timestamps: true,
    updatedAt: true,
    createdAt: "publishedAt",
    underscored: true,
    indexes: [
      { fields: ["is_pinned"] },
      { fields: ["is_active"] },
      { fields: ["published_at"] },
    ],
  }
);

NoticeModel.belongsTo(UserModel, { foreignKey: "adminId", as: "admin" });
UserModel.hasMany(NoticeModel, { foreignKey: "adminId", as: "notices" });