import { Booking } from "../../domain/entities/Booking";
import { IBookingRepository } from "../../domain/repositories/IBookingRepository";
import { IAmenityRepository } from "../../domain/repositories/IAmenityRepository";
import { IBookingNotifier } from "../../domain/services/IBookingNotifier";
import { BookingNotFoundError } from "../../domain/errors/BookingErrors";
import { RequestingUser } from "../../../../shared/types/RequestingUser";

export class ApproveBookingUseCase {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly notifier: IBookingNotifier,
    private readonly amenityRepository: IAmenityRepository
  ) {}

  async execute(id: number, requestingUser?: RequestingUser): Promise<Booking> {
    const booking = await this.bookingRepository.findById(id);
    if (!booking) throw new BookingNotFoundError();

    booking.approve(requestingUser?.userId ?? 0);
    const updated = await this.bookingRepository.update(booking);

    const amenity = await this.amenityRepository.findById(booking.amenityId);
    if (amenity) await this.notifier.notifyConfirmed(updated, amenity);

    return updated;
  }
}
