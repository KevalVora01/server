import { BookingVote } from "../../domain/entities/BookingVote";
import { IBookingVoteRepository } from "../../domain/repositories/IBookingVoteRepository";
import { IBookingRepository } from "../../domain/repositories/IBookingRepository";
import { BulkRecordBookingVotesDto } from "../dtos/BulkRecordBookingVotesDto";
import { BookingNotFoundError } from "../../domain/errors/BookingErrors";
import { VotingEngine, VoteChoice } from "../../../../shared/voting";

export class BulkRecordBookingVotesUseCase {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly bookingVoteRepository: IBookingVoteRepository
  ) {}

  async execute(
    bookingId: number,
    dto: BulkRecordBookingVotesDto,
    adminUserId: number
  ): Promise<BookingVote[]> {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) throw new BookingNotFoundError();

    if (booking.status !== "Pending") {
      throw new Error(`Cannot record votes for a booking with status ${booking.status}`);
    }

    VotingEngine.validateVoteBatch({
      votes: dto.votes,
      adminVote: dto.adminVote,
    });

    const voteEntities: BookingVote[] = [];

    if (dto.votes) {
      dto.votes.forEach((v) => {
        voteEntities.push(
          BookingVote.create({
            bookingId,
            committeeMemberId: v.committeeMemberId,
            vote: v.vote as VoteChoice,
            recordedByAdminId: adminUserId,
          })
        );
      });
    }

    if (dto.adminVote) {
      voteEntities.push(
        BookingVote.create({
          bookingId,
          vote: dto.adminVote as VoteChoice,
          recordedByAdminId: adminUserId,
        })
      );
    }

    await this.bookingVoteRepository.deleteByBookingId(bookingId);
    return this.bookingVoteRepository.bulkCreate(voteEntities);
  }
}
