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
  DuplicateResidentBookingError,
  PastBookingError,
} from "../../domain/errors/BookingErrors";

export class BookingConflictService implements IBookingConflictService {
  constructor(
    private readonly blackoutRepository: IBlackoutRepository,
    private readonly bookingRepository: IBookingRepository
  ) {}

  async assertAvailable(input: BookingConflictCheckInput): Promise<void> {
    const {
      amenity,
      date,
      startTime,
      endTime,
      requestedMemberCount,
      residentId,
      apartmentId,
      excludeBookingId,
    } = input;

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
          blackout.reason
            ? `Amenity is unavailable due to maintenance: ${blackout.reason}`
            : "This time slot falls within a blackout period"
        );
      }
    }

    const existing = await this.bookingRepository.findOverlapping(
      amenity.id!,
      date,
      ["Pending", "Confirmed"]
    );

    // Check if THIS resident/apartment already has an active booking for this amenity during the overlapping time
    if (residentId || apartmentId) {
      const duplicate = existing.find(
        (b) =>
          (!excludeBookingId || b.id !== excludeBookingId) &&
          ((residentId && b.residentId === residentId) ||
            (apartmentId && b.apartmentId === apartmentId)) &&
          b.overlapsWith(startTime, endTime)
      );

      if (duplicate) {
        throw new DuplicateResidentBookingError(
          `You already have an active booking (${duplicate.startTime} – ${duplicate.endTime}) for ${amenity.name} on this date. A resident cannot book overlapping slots for the same facility.`
        );
      }
    }

    const requestedCount =
      requestedMemberCount && requestedMemberCount > 0 ? requestedMemberCount : 1;

    if (amenity.isSharedCapacity) {
      const maxCap =
        amenity.capacity && amenity.capacity > 0 ? amenity.capacity : 25;
      const currentOccupancy = existing
        .filter(
          (b) =>
            (!excludeBookingId || b.id !== excludeBookingId) &&
            b.overlapsWith(startTime, endTime)
        )
        .reduce((sum, b) => sum + (b.memberCount || 1), 0);

      const availableSpots = Math.max(0, maxCap - currentOccupancy);

      if (currentOccupancy + requestedCount > maxCap) {
        if (availableSpots <= 0) {
          throw new SlotConflictError(
            `This time slot is full (Maximum capacity of ${maxCap} reached). Please choose another time.`
          );
        } else {
          throw new SlotConflictError(
            `Only ${availableSpots} spot${availableSpots > 1 ? "s" : ""} remaining for this time slot (requested ${requestedCount}). Please reduce the number of family members or choose another time.`
          );
        }
      }
    } else {
      for (const booking of existing) {
        if (excludeBookingId && booking.id === excludeBookingId) continue;
        if (booking.overlapsWith(startTime, endTime)) {
          throw new SlotConflictError(
            "This time slot is already reserved by another resident."
          );
        }
      }
    }
  }
}
