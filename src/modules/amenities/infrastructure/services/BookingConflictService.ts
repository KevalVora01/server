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
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
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
        throw new BlackoutConflictError(
          blackout.reason ? `Amenity is unavailable due to maintenance: ${blackout.reason}` : "This time slot falls within a blackout period"
        );
      }
    }

    const existing = await this.bookingRepository.findOverlapping(
      amenity.id!,
      date,
      ["Pending", "Confirmed"]
    );

    if (amenity.isSharedCapacity) {
      const maxCap = amenity.capacity && amenity.capacity > 0 ? amenity.capacity : 25;
      const overlappingCount = existing.filter(
        (b) => (!excludeBookingId || b.id !== excludeBookingId) && b.overlapsWith(startTime, endTime)
      ).length;

      if (overlappingCount >= maxCap) {
        throw new SlotConflictError(
          `This time slot is full (Maximum capacity of ${maxCap} people reached). Please choose another time.`
        );
      }
    } else {
      for (const booking of existing) {
        if (excludeBookingId && booking.id === excludeBookingId) continue;
        if (booking.overlapsWith(startTime, endTime)) {
          throw new SlotConflictError("This time slot is already reserved by another resident.");
        }
      }
    }
  }
}
