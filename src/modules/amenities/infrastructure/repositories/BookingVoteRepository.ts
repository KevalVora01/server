import { IBookingVoteRepository } from "../../domain/repositories/IBookingVoteRepository";
import { BookingVote } from "../../domain/entities/BookingVote";
import { BookingVoteModel } from "../models/BookingVoteModel";
import { ResidentModel } from "../../../residents/infrastructure/models/ResidentModel";
import { UserModel } from "../../../auth/infrastructure/models/UserModel";
import { VoteChoice } from "../../../../shared/voting";

export class BookingVoteRepository implements IBookingVoteRepository {
  private toEntity(model: BookingVoteModel): BookingVote {
    const raw = model.get({ plain: true }) as any;
    const entity = new BookingVote({
      id: model.id,
      bookingId: model.bookingId,
      committeeMemberId: model.committeeMemberId,
      vote: model.vote as VoteChoice,
      recordedByAdminId: model.recordedByAdminId,
      createdAt: model.createdAt,
    });
    entity.committeeMember = raw.committeeMember;
    return entity;
  }

  async findByBookingId(bookingId: number): Promise<BookingVote[]> {
    const rows = await BookingVoteModel.findAll({
      where: { bookingId },
      include: [
        {
          model: ResidentModel,
          as: "committeeMember",
          attributes: ["id", "apartmentId"],
          include: [
            { model: UserModel, as: "user", attributes: ["id", "name", "email"], required: false },
          ],
        },
      ],
    });
    return rows.map((r) => this.toEntity(r));
  }

  async bulkCreate(votes: BookingVote[]): Promise<BookingVote[]> {
    const payload = votes.map((v) => ({
      bookingId: v.bookingId,
      committeeMemberId: v.committeeMemberId,
      vote: v.vote,
      recordedByAdminId: v.recordedByAdminId,
      createdAt: v.createdAt,
    }));
    const created = await BookingVoteModel.bulkCreate(payload as any);
    return created.map((c) => this.toEntity(c));
  }

  async deleteByBookingId(bookingId: number): Promise<void> {
    await BookingVoteModel.destroy({ where: { bookingId } });
  }
}
