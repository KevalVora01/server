import { Booking, BookingStatus } from "../../domain/entities/Booking";
import { IBookingRepository } from "../../domain/repositories/IBookingRepository";
import { PaginatedRequest, PaginatedResult } from "../../../../shared/types/Pagination";

export interface ListBookingsFilters extends PaginatedRequest {
  amenityId?: number;
  status?: BookingStatus;
  date?: string;
  residentId?: number;
}

export class ListBookingsUseCase {
  constructor(private readonly bookingRepository: IBookingRepository) {}

  async execute(filters: ListBookingsFilters): Promise<PaginatedResult<Booking>> {
    return this.bookingRepository.findAllPaginated({
      amenityId: filters.amenityId,
      status: filters.status,
      fromDate: filters.date,
      toDate: filters.date,
      residentId: filters.residentId,
      pageNumber: filters.pageNumber,
      pageSize: filters.pageSize,
    });
  }
}
