import { Amenity } from "../entities/Amenity";

export interface BookingConflictCheckInput {
  amenity: Amenity;
  date: string;
  startTime: string;
  endTime: string;
  excludeBookingId?: number; // when re-checking an existing booking (e.g. on edit)
}

export interface IBookingConflictService {
  /**
   * Runs all three checks in order: operating hours -> blackout -> overlapping bookings.
   * Throws the specific domain error (OutsideOperatingHoursError, BlackoutConflictError,
   * SlotConflictError) for whichever check fails first — does not return a boolean,
   * so the use-case doesn't need its own if/else translation to errors.
   */
  assertAvailable(input: BookingConflictCheckInput): Promise<void>;
}