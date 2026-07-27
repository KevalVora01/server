import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../../../shared/config/sequelize";
import { DocumentRequestModel } from "./DocumentRequestModel";
import { UserModel } from "../../../auth/infrastructure/models/UserModel";
import { ResidentModel } from "../../../residents/infrastructure/models/ResidentModel";
import { VoteChoice } from "../../domain/entities/DocumentRequestVote";

interface DocumentRequestVoteAttributes {
  id: number;
  documentRequestId: number;
  committeeMemberId: number | null;
  vote: VoteChoice;
  recordedByAdminId: number | null;
  createdAt: Date;
}

interface DocumentRequestVoteCreationAttributes
  extends Optional<DocumentRequestVoteAttributes, "id" | "createdAt"> {}

export class DocumentRequestVoteModel
  extends Model<DocumentRequestVoteAttributes, DocumentRequestVoteCreationAttributes>
  implements DocumentRequestVoteAttributes {
  declare id: number;
  declare documentRequestId: number;
  declare committeeMemberId: number | null;
  declare vote: VoteChoice;
  declare recordedByAdminId: number | null;
  declare createdAt: Date;
}

DocumentRequestVoteModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    documentRequestId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: DocumentRequestModel, key: "id" },
    },
    committeeMemberId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: ResidentModel, key: "id" },
    },
    vote: {
      type: DataTypes.ENUM(...Object.values(VoteChoice)),
      allowNull: false,
    },
    recordedByAdminId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: UserModel, key: "id" },
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "document_request_votes",
    modelName: "DocumentRequestVote",
    timestamps: true,
    updatedAt: false,
    underscored: true,
    indexes: [
      { fields: ["document_request_id"] },
      { unique: true, fields: ["document_request_id", "committee_member_id"], name: "uniq_doc_vote_per_member" },
    ],
  }
);

DocumentRequestVoteModel.belongsTo(DocumentRequestModel, { foreignKey: "documentRequestId", as: "documentRequest" });
DocumentRequestVoteModel.belongsTo(ResidentModel, { foreignKey: "committeeMemberId", as: "committeeMember" });
DocumentRequestVoteModel.belongsTo(UserModel, { foreignKey: "recordedByAdminId", as: "recordedByAdmin" });
