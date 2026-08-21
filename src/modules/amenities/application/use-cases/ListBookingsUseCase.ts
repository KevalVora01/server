import { Booking, BookingStatus } from "../../domain/entities/Booking";
import { IBookingRepository } from "../../domain/repositories/IBookingRepository";

export interface ListBookingsFilters {
  amenityId?: number;
  status?: BookingStatus;
  date?: string;
  residentId?: number;
}

export class ListBookingsUseCase {
  constructor(private readonly bookingRepository: IBookingRepository) {}

  async execute(filters: ListBookingsFilters = {}): Promise<Booking[]> {
    const bookings = await this.bookingRepository.findAll({
      amenityId: filters.amenityId,
      status: filters.status,
      fromDate: filters.date,
      toDate: filters.date,
    });

    if (filters.residentId) {
      return bookings.filter((b) => b.residentId === filters.residentId);
    }
    return bookings;
  }
}
