import { Booking } from "../../domain/entities/Booking";
import { IBookingRepository } from "../../domain/repositories/IBookingRepository";
import { IAmenityRepository } from "../../domain/repositories/IAmenityRepository";
import { IBookingNotifier } from "../../domain/services/IBookingNotifier";
import { BookingNotFoundError, UnauthorizedBookingAccessError } from "../../domain/errors/BookingErrors";
import { CancelBookingDto } from "../dtos/CancelBookingDto";
import { RequestingUser } from "../../../../shared/types/RequestingUser";
import { UserRole } from "../../../auth/domain/entities/User";

export class CancelBookingUseCase {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly notifier: IBookingNotifier,
    private readonly amenityRepository: IAmenityRepository
  ) {}

  async execute(
    id: number,
    dto: CancelBookingDto,
    requestingUser?: RequestingUser
  ): Promise<Booking> {
    const booking = await this.bookingRepository.findById(id);
    if (!booking) throw new BookingNotFoundError();

    const isAdmin = requestingUser?.role === UserRole.ADMIN;
    const isOwner =
      requestingUser?.residentId !== undefined &&
      booking.residentId === requestingUser.residentId;
    if (!isAdmin && !isOwner) throw new UnauthorizedBookingAccessError();

    // Check if the booking is in the past
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const todayStr = `${year}-${month}-${day}`;

    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const nowTimeStr = `${hours}:${minutes}`;

    const isPast =
      booking.bookingDate < todayStr ||
      (booking.bookingDate === todayStr && booking.startTime <= nowTimeStr);

    if (isPast) {
      throw new Error("Past bookings cannot be cancelled");
    }

    booking.cancel(dto.reason);
    const updated = await this.bookingRepository.update(booking);

    const amenity = await this.amenityRepository.findById(booking.amenityId);
    if (amenity) await this.notifier.notifyCancelled(updated, amenity);

    return updated;
  }
}
