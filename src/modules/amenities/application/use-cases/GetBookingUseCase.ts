import { Booking } from "../../domain/entities/Booking";
import { IBookingRepository } from "../../domain/repositories/IBookingRepository";
import {
  BookingNotFoundError,
  UnauthorizedBookingAccessError,
} from "../../domain/errors/BookingErrors";
import { RequestingUser } from "../../../../shared/types/RequestingUser";
import { UserRole } from "../../../auth/domain/entities/User";

export class GetBookingUseCase {
  constructor(private readonly bookingRepository: IBookingRepository) {}

  async execute(id: number, requestingUser?: RequestingUser): Promise<Booking> {
    const booking = await this.bookingRepository.findById(id);
    if (!booking) throw new BookingNotFoundError();

    const isAdmin = requestingUser?.role === UserRole.ADMIN;
    const isOwner =
      requestingUser?.residentId !== undefined &&
      booking.residentId === requestingUser.residentId;
    if (!isAdmin && !isOwner) throw new UnauthorizedBookingAccessError();

    return booking;
  }
}
