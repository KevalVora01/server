import { Booking } from "../../domain/entities/Booking";
import { IBookingRepository } from "../../domain/repositories/IBookingRepository";

export class ListMyBookingsUseCase {
  constructor(private readonly bookingRepository: IBookingRepository) {}

  async execute(
    residentId: number,
    scope: "upcoming" | "past" = "upcoming"
  ): Promise<Booking[]> {
    const bookings = await this.bookingRepository.findByResident(residentId);

    // Compute local date (YYYY-MM-DD) and time (HH:mm)
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const todayStr = `${year}-${month}-${day}`;

    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const nowTimeStr = `${hours}:${minutes}`;

    const isPast = (b: Booking): boolean => {
      // 1. Cancelled or Rejected bookings are concluded
      if (b.status === "Cancelled" || b.status === "Rejected") {
        return true;
      }
      // 2. Date has passed
      if (b.bookingDate < todayStr) {
        return true;
      }
      // 3. Date is today, but the time slot has already ended
      if (b.bookingDate === todayStr && b.endTime <= nowTimeStr) {
        return true;
      }
      return false;
    };

    if (scope === "upcoming") {
      return bookings
        .filter((b) => !isPast(b))
        .sort((a, b) => {
          if (a.bookingDate !== b.bookingDate) {
            return a.bookingDate.localeCompare(b.bookingDate);
          }
          return a.startTime.localeCompare(b.startTime);
        });
    } else {
      return bookings
        .filter((b) => isPast(b))
        .sort((a, b) => {
          if (a.bookingDate !== b.bookingDate) {
            return b.bookingDate.localeCompare(a.bookingDate);
          }
          return b.startTime.localeCompare(a.startTime);
        });
    }
  }
}
