import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../../../shared/config/sequelize";
import { UserModel } from "../../../auth/infrastructure/models/UserModel";
import { NotificationType } from "../../domain/entities/Notification";

interface NotificationAttributes {
  id: number;
  userId: number;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, unknown>;
  isRead: boolean;
  createdAt: Date;
}

interface NotificationCreationAttributes
  extends Optional<NotificationAttributes, "id" | "isRead" | "createdAt"> { }

export class NotificationModel
  extends Model<NotificationAttributes, NotificationCreationAttributes>
  implements NotificationAttributes {
  declare id: number;
  declare userId: number;
  declare type: NotificationType;
  declare title: string;
  declare body: string;
  declare data: Record<string, unknown>;
  declare isRead: boolean;
  declare createdAt: Date;
}

NotificationModel.init(
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
    type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    data: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "notifications",
    modelName: "Notification",
    timestamps: true,
    updatedAt: false,
    underscored: true,
    indexes: [
      { fields: ["user_id"] },
      { fields: ["user_id", "is_read"] },
      { fields: ["created_at"] },
    ],
  }
);

NotificationModel.belongsTo(UserModel, { foreignKey: "userId", as: "user" });
UserModel.hasMany(NotificationModel, { foreignKey: "userId", as: "notifications" });