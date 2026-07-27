import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../../../shared/config/sequelize";
import { ComplaintModel } from "./ComplaintModel";
import { UserModel } from "../../../auth/infrastructure/models/UserModel";

interface ComplaintCommentAttributes {
  id: number;
  complaintId: number;
  userId: number;
  content: string;
  createdAt: Date;
}

interface ComplaintCommentCreationAttributes
  extends Optional<ComplaintCommentAttributes, "id" | "createdAt"> { }

export class ComplaintCommentModel
  extends Model<ComplaintCommentAttributes, ComplaintCommentCreationAttributes>
  implements ComplaintCommentAttributes {
  declare id: number;
  declare complaintId: number;
  declare userId: number;
  declare content: string;
  declare createdAt: Date;
}

ComplaintCommentModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    complaintId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: ComplaintModel,
        key: "id",
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: UserModel,
        key: "id",
      },
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "complaint_comments",
    modelName: "ComplaintComment",
    timestamps: true,
    updatedAt: false,
    underscored: true,
    indexes: [
      { fields: ["complaint_id"] },
      { fields: ["user_id"] },
    ],
  }
);

ComplaintCommentModel.belongsTo(ComplaintModel, { foreignKey: "complaintId", as: "complaint" });
ComplaintCommentModel.belongsTo(UserModel, { foreignKey: "userId", as: "user" });
ComplaintModel.hasMany(ComplaintCommentModel, { foreignKey: "complaintId", as: "comments" });
UserModel.hasMany(ComplaintCommentModel, { foreignKey: "userId", as: "complaintComments" });