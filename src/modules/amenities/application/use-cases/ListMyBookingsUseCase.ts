import { Booking } from "../../domain/entities/Booking";
import { IBookingRepository } from "../../domain/repositories/IBookingRepository";

export class ListMyBookingsUseCase {
  constructor(private readonly bookingRepository: IBookingRepository) {}

  async execute(
    residentId: number,
    scope: "upcoming" | "past" = "upcoming"
  ): Promise<Booking[]> {
    const bookings = await this.bookingRepository.findByResident(residentId);
    const today = new Date().toISOString().slice(0, 10);
    return bookings.filter((b) =>
      scope === "upcoming" ? b.bookingDate >= today : b.bookingDate < today
    );
  }
}
