import { Booking, BookingStatus } from "../entities/Booking";
import { PaginatedResult } from "../../../../shared/types/Pagination";

export interface IBookingRepository {
  create(booking: Booking): Promise<Booking>;
  findById(id: number): Promise<Booking | null>;
  update(booking: Booking): Promise<Booking>;

  /**
   * Finds bookings for a given amenity/date whose status is in `statuses`
   * and whose time range could overlap the requested window.
   * Used by BookingConflictService — kept broad (date-level filter) and lets
   * the entity's overlapsWith() do the precise time-range check in memory,
   * so the conflict rule itself isn't duplicated in SQL.
   */
  findOverlapping(
    amenityId: number,
    date: string,
    statuses: BookingStatus[]
  ): Promise<Booking[]>;

  findByApartment(apartmentId: number): Promise<Booking[]>;
  findByResident(residentId: number): Promise<Booking[]>;
  findAll(filters?: {
    amenityId?: number;
    status?: BookingStatus;
    fromDate?: string;
    toDate?: string;
    residentId?: number;
    pageNumber?: number;
    pageSize?: number;
  }): Promise<PaginatedResult<Booking>>;

  /** For SendBookingRemindersJob — confirmed bookings starting soon, not yet reminded */
  findUpcomingConfirmed(withinMinutes: number): Promise<Booking[]>;

  /** For GetBookingStatsUseCase */
  countByStatus(status: BookingStatus): Promise<number>;
}