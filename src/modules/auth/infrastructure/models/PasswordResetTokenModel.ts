import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../../../shared/config/sequelize";
import { UserModel } from "./UserModel";

interface PasswordResetTokenAttributes {
  id: number;
  userId: number;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

interface PasswordResetTokenCreationAttributes
  extends Optional<PasswordResetTokenAttributes, "id" | "createdAt"> { }

export class PasswordResetTokenModel
  extends Model<PasswordResetTokenAttributes, PasswordResetTokenCreationAttributes>
  implements PasswordResetTokenAttributes {
  declare id: number;
  declare userId: number;
  declare token: string;
  declare expiresAt: Date;
  declare createdAt: Date;
}

PasswordResetTokenModel.init(
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
    token: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "password_reset_tokens",
    modelName: "PasswordResetToken",
    timestamps: true,
    underscored: true,
  }
);

PasswordResetTokenModel.belongsTo(UserModel, { foreignKey: "userId", as: "user" });