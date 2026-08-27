import { Booking } from "../../domain/entities/Booking";
import { IBookingRepository } from "../../domain/repositories/IBookingRepository";
import { IBookingVoteRepository } from "../../domain/repositories/IBookingVoteRepository";
import { IAmenityRepository } from "../../domain/repositories/IAmenityRepository";
import { IBookingNotifier } from "../../domain/services/IBookingNotifier";
import { BookingNotFoundError } from "../../domain/errors/BookingErrors";
import { VotingEngine } from "../../../../shared/voting";

export class FinalizeBookingUseCase {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly bookingVoteRepository: IBookingVoteRepository,
    private readonly notifier: IBookingNotifier,
    private readonly amenityRepository: IAmenityRepository
  ) { }

  async execute(bookingId: number, adminUserId: number): Promise<Booking> {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) throw new BookingNotFoundError();

    if (booking.status !== "Pending") {
      throw new Error(`Cannot finalize a booking with status ${booking.status}`);
    }

    const votes = await this.bookingVoteRepository.findByBookingId(bookingId);
    if (votes.length === 0) {
      throw new Error("No votes recorded for this booking request.");
    }

    const outcome = VotingEngine.evaluateOutcome(
      votes.map((v) => ({
        committeeMemberId: v.committeeMemberId,
        vote: v.vote,
        recordedByAdminId: v.recordedByAdminId,
      }))
    );

    if (outcome.isApproved) {
      booking.approve(adminUserId);
    } else {
      booking.reject(outcome.reason);
    }

    const updated = await this.bookingRepository.update(booking);

    const amenity = await this.amenityRepository.findById(booking.amenityId);
    if (amenity) {
      if (outcome.isApproved) {
        await this.notifier.notifyConfirmed(updated, amenity);
      } else {
        await this.notifier.notifyRejected(updated, amenity);
      }
    }

    return updated;
  }
}
