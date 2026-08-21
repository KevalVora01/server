import { Booking } from "../../domain/entities/Booking";
import { IBookingRepository } from "../../domain/repositories/IBookingRepository";
import { IAmenityRepository } from "../../domain/repositories/IAmenityRepository";
import { IBookingNotifier } from "../../domain/services/IBookingNotifier";
import {
  BookingNotFoundError,
  BookingAlreadyPaidError,
  InvalidUpiRefError,
  OnlyUpiPaymentAllowedError,
  UnauthorizedBookingAccessError,
} from "../../domain/errors/BookingErrors";
import { SettleBookingDto } from "../dtos/SettleBookingDto";
import { RequestingUser } from "../../../../shared/types/RequestingUser";
import { UserRole } from "../../../auth/domain/entities/User";

export class SettleBookingUseCase {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly notifier: IBookingNotifier,
    private readonly amenityRepository: IAmenityRepository
  ) {}

  async execute(
    id: number,
    dto: SettleBookingDto,
    requestingUser?: RequestingUser
  ): Promise<Booking> {
    const booking = await this.bookingRepository.findById(id);
    if (!booking) throw new BookingNotFoundError();

    const isOwner =
      requestingUser?.residentId !== undefined &&
      booking.residentId === requestingUser.residentId;
    const isAdmin = requestingUser?.role === UserRole.ADMIN;
    if (!isOwner && !isAdmin) throw new UnauthorizedBookingAccessError();

    if (booking.isPaid()) throw new BookingAlreadyPaidError();

    if (!dto.paymentRef || !dto.paymentRef.toUpperCase().startsWith("UPI")) {
      throw new OnlyUpiPaymentAllowedError();
    }
    const utrPart = dto.paymentRef.replace(/^UPI\s*[-:]?\s*/i, "").trim();
    if (utrPart && !/^\d{12}$/.test(utrPart)) {
      throw new InvalidUpiRefError();
    }

    booking.markPaid(dto.paymentRef);
    const updated = await this.bookingRepository.update(booking);

    const amenity = await this.amenityRepository.findById(booking.amenityId);
    if (amenity) await this.notifier.notifyPaymentSucceeded(updated, amenity);

    return updated;
  }
}
