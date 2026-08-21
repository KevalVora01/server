import { Booking } from "../../domain/entities/Booking";
import { IBookingRepository } from "../../domain/repositories/IBookingRepository";
import { IAmenityRepository } from "../../domain/repositories/IAmenityRepository";
import { IBookingNotifier } from "../../domain/services/IBookingNotifier";
import { BookingNotFoundError } from "../../domain/errors/BookingErrors";
import { RejectBookingDto } from "../dtos/RejectBookingDto";

export class RejectBookingUseCase {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly notifier: IBookingNotifier,
    private readonly amenityRepository: IAmenityRepository
  ) {}

  async execute(id: number, dto: RejectBookingDto): Promise<Booking> {
    const booking = await this.bookingRepository.findById(id);
    if (!booking) throw new BookingNotFoundError();

    booking.reject(dto.reason);
    const updated = await this.bookingRepository.update(booking);

    const amenity = await this.amenityRepository.findById(booking.amenityId);
    if (amenity) await this.notifier.notifyRejected(updated, amenity);

    return updated;
  }
}
