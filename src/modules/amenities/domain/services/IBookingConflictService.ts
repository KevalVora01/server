import { Amenity } from "../entities/Amenity";

export interface BookingConflictCheckInput {
  amenity: Amenity;
  date: string;
  startTime: string;
  endTime: string;
  requestedMemberCount?: number;
  residentId?: number;
  apartmentId?: number;
  excludeBookingId?: number; // when re-checking an existing booking (e.g. on edit)
}

export interface IBookingConflictService {
  /**
   * Runs all checks in order: operating hours -> blackout -> duplicate resident booking -> slot capacity / overlap.
   * Throws the specific domain error (OutsideOperatingHoursError, BlackoutConflictError,
   * DuplicateResidentBookingError, SlotConflictError) for whichever check fails first.
   */
  assertAvailable(input: BookingConflictCheckInput): Promise<void>;
}