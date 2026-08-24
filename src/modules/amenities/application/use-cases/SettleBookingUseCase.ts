import { Booking } from "../../domain/entities/Booking";
import { IBookingRepository } from "../../domain/repositories/IBookingRepository";
import { IAmenityRepository } from "../../domain/repositories/IAmenityRepository";
import { IBookingNotifier } from "../../domain/services/IBookingNotifier";
import { BookingPdfService } from "../../infrastructure/services/BookingPdfService";
import {
  BookingNotFoundError,
  BookingAlreadyPaidError,
  InvalidUpiRefError,
  OnlyUpiPaymentAllowedError,
  UnauthorizedBookingAccessError,
} from "../../domain/errors/BookingErrors";
import { SettleBookingDto } from "../dtos/SettleBookingDto";
import { RequestingUser } from "../../../../shared/types/RequestingUser";

export class SettleBookingUseCase {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly notifier: IBookingNotifier,
    private readonly amenityRepository: IAmenityRepository,
    private readonly bookingPdfService?: BookingPdfService
  ) {}

  async execute(
    id: number,
    dto: SettleBookingDto,
    requestingUser?: RequestingUser
  ): Promise<Booking> {
    const booking = await this.bookingRepository.findById(id);
    if (!booking) throw new BookingNotFoundError();

    // Only the resident who made the booking request is allowed to pay the fees
    const isOwner =
      requestingUser?.residentId !== undefined &&
      booking.residentId === requestingUser.residentId;
    if (!isOwner) {
      throw new UnauthorizedBookingAccessError();
    }

    if (booking.isPaid()) throw new BookingAlreadyPaidError();

    if (!dto.paymentRef || !dto.paymentRef.toUpperCase().startsWith("UPI")) {
      throw new OnlyUpiPaymentAllowedError();
    }
    const utrPart = dto.paymentRef.replace(/^UPI\s*[-:]?\s*/i, "").trim();
    if (utrPart && !/^\d{12}$/.test(utrPart)) {
      throw new InvalidUpiRefError();
    }

    booking.markPaid(dto.paymentRef);

    const amenity = await this.amenityRepository.findById(booking.amenityId);

    // Automatically generate and attach receipt PDF
    if (this.bookingPdfService) {
      try {
        const receiptUrl = await this.bookingPdfService.generateAndUpload(booking, amenity);
        if (receiptUrl) {
          booking.setReceiptUrl(receiptUrl);
        }
      } catch (err) {
        console.warn("Could not generate booking receipt PDF immediately upon payment:", err);
      }
    }

    const updated = await this.bookingRepository.update(booking);

    if (amenity) await this.notifier.notifyPaymentSucceeded(updated, amenity);

    return updated;
  }
}
