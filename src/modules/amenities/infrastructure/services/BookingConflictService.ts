import { Amenity } from "../../domain/entities/Amenity";
import {
  BookingConflictCheckInput,
  IBookingConflictService,
} from "../../domain/services/IBookingConflictService";
import { IBlackoutRepository } from "../../domain/repositories/IBlackoutRepository";
import { IBookingRepository } from "../../domain/repositories/IBookingRepository";
import {
  BlackoutConflictError,
  OutsideOperatingHoursError,
  SlotConflictError,
  PastBookingError,
} from "../../domain/errors/BookingErrors";

export class BookingConflictService implements IBookingConflictService {
  constructor(
    private readonly blackoutRepository: IBlackoutRepository,
    private readonly bookingRepository: IBookingRepository
  ) {}

  async assertAvailable(input: BookingConflictCheckInput): Promise<void> {
    const { amenity, date, startTime, endTime, excludeBookingId } = input;

    // Reject past dates or past time slots on current date
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    if (date < todayStr) {
      throw new PastBookingError("Cannot book an amenity for a past date");
    }
    if (date === todayStr) {
      const currentH = String(now.getHours()).padStart(2, "0");
      const currentM = String(now.getMinutes()).padStart(2, "0");
      const currentTimeStr = `${currentH}:${currentM}`;
      if (startTime < currentTimeStr) {
        throw new PastBookingError("Cannot book an amenity for a past time today");
      }
    }

    if (!amenity.isWithinOperatingHours(startTime, endTime)) {
      throw new OutsideOperatingHoursError();
    }

    const blackouts = await this.blackoutRepository.findByAmenityAndDate(
      amenity.id!,
      date
    );
    for (const blackout of blackouts) {
      if (blackout.overlapsWith(date, startTime, endTime)) {
        throw new BlackoutConflictError();
      }
    }

    const existing = await this.bookingRepository.findOverlapping(
      amenity.id!,
      date,
      ["Pending", "Confirmed"]
    );
    for (const booking of existing) {
      if (excludeBookingId && booking.id === excludeBookingId) continue;
      if (booking.overlapsWith(startTime, endTime)) {
        throw new SlotConflictError();
      }
    }
  }
}
