import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../../../shared/config/sequelize";
import { TenantRequestModel } from "./TenantRequestModel";
import { UserModel } from "../../../auth/infrastructure/models/UserModel";
import { VoteChoice } from "../../domain/entities/TenantRequestVote";
import { ResidentModel } from "../../../residents/infrastructure/models/ResidentModel";

interface TenantRequestVoteAttributes {
  id: number;
  tenantRequestId: number;
  committeeMemberId: number | null;
  vote: VoteChoice;
  recordedByAdminId: number | null;
  createdAt: Date;
}

interface TenantRequestVoteCreationAttributes
  extends Optional<TenantRequestVoteAttributes, "id" | "createdAt"> { }

export class TenantRequestVoteModel
  extends Model<TenantRequestVoteAttributes, TenantRequestVoteCreationAttributes>
  implements TenantRequestVoteAttributes {
  declare id: number;
  declare tenantRequestId: number;
  declare committeeMemberId: number | null;
  declare vote: VoteChoice;
  declare recordedByAdminId: number | null;
  declare createdAt: Date;
}

TenantRequestVoteModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    tenantRequestId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: TenantRequestModel,
        key: "id",
      },
    },
    committeeMemberId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: ResidentModel,
        key: "id",
      },
    },
    vote: {
      type: DataTypes.ENUM(...Object.values(VoteChoice)),
      allowNull: false,
    },
    recordedByAdminId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: UserModel,
        key: "id",
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "tenant_request_votes",
    modelName: "TenantRequestVote",
    timestamps: true,
    updatedAt: false,
    underscored: true,
    indexes: [
      { fields: ["tenant_request_id"] },
      { unique: true, fields: ["tenant_request_id", "committee_member_id"], name: "uniq_vote_per_member_per_request" },
    ],
  }
);

TenantRequestVoteModel.belongsTo(TenantRequestModel, { foreignKey: "tenantRequestId", as: "tenantRequest" });
TenantRequestVoteModel.belongsTo(ResidentModel, { foreignKey: "committeeMemberId", as: "committeeMember" });
TenantRequestVoteModel.belongsTo(UserModel, { foreignKey: "recordedByAdminId", as: "recordedByAdmin" });