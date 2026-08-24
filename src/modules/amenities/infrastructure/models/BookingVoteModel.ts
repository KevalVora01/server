import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../../../shared/config/sequelize";
import { BookingModel } from "./BookingModel";
import { UserModel } from "../../../auth/infrastructure/models/UserModel";
import { ResidentModel } from "../../../residents/infrastructure/models/ResidentModel";
import { VoteChoice } from "../../../../shared/voting";

interface BookingVoteAttributes {
  id: number;
  bookingId: number;
  committeeMemberId: number | null;
  vote: VoteChoice;
  recordedByAdminId: number | null;
  createdAt: Date;
}

interface BookingVoteCreationAttributes
  extends Optional<BookingVoteAttributes, "id" | "createdAt"> {}

export class BookingVoteModel
  extends Model<BookingVoteAttributes, BookingVoteCreationAttributes>
  implements BookingVoteAttributes {
  declare id: number;
  declare bookingId: number;
  declare committeeMemberId: number | null;
  declare vote: VoteChoice;
  declare recordedByAdminId: number | null;
  declare createdAt: Date;
}

BookingVoteModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    bookingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: BookingModel, key: "id" },
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
    tableName: "booking_votes",
    modelName: "BookingVote",
    timestamps: true,
    updatedAt: false,
    underscored: true,
    indexes: [
      { fields: ["booking_id"] },
      { unique: true, fields: ["booking_id", "committee_member_id"], name: "uniq_booking_vote_per_member" },
    ],
  }
);

BookingVoteModel.belongsTo(BookingModel, { foreignKey: "bookingId", as: "booking" });
BookingVoteModel.belongsTo(ResidentModel, { foreignKey: "committeeMemberId", as: "committeeMember" });
BookingVoteModel.belongsTo(UserModel, { foreignKey: "recordedByAdminId", as: "recordedByAdmin" });
