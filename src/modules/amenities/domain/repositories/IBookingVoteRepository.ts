import { BookingVote } from "../entities/BookingVote";

export interface IBookingVoteRepository {
  findByBookingId(bookingId: number): Promise<BookingVote[]>;
  bulkCreate(votes: BookingVote[]): Promise<BookingVote[]>;
  deleteByBookingId(bookingId: number): Promise<void>;
}
