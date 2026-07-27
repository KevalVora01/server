import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../../../shared/config/sequelize";
import { ComplaintModel } from "./ComplaintModel";

interface ComplaintImageAttributes {
  id: number;
  complaintId: number;
  imageUrl: string;
  createdAt: Date;
}

interface ComplaintImageCreationAttributes
  extends Optional<ComplaintImageAttributes, "id" | "createdAt"> { }

export class ComplaintImageModel
  extends Model<ComplaintImageAttributes, ComplaintImageCreationAttributes>
  implements ComplaintImageAttributes {
  declare id: number;
  declare complaintId: number;
  declare imageUrl: string;
  declare createdAt: Date;
}

ComplaintImageModel.init(
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
    imageUrl: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "complaint_images",
    modelName: "ComplaintImage",
    timestamps: true,
    updatedAt: false,
    underscored: true,
    indexes: [{ fields: ["complaint_id"] }],
  }
);

ComplaintImageModel.belongsTo(ComplaintModel, { foreignKey: "complaintId", as: "complaint" });
ComplaintModel.hasMany(ComplaintImageModel, { foreignKey: "complaintId", as: "images" });