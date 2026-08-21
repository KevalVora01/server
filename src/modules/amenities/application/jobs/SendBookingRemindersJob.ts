import { IBookingRepository } from "../../domain/repositories/IBookingRepository";
import { IAmenityRepository } from "../../domain/repositories/IAmenityRepository";
import { IBookingNotifier } from "../../domain/services/IBookingNotifier";

export class SendBookingRemindersJob {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly amenityRepository: IAmenityRepository,
    private readonly notifier: IBookingNotifier
  ) {}

  async execute(): Promise<{ reminded: number }> {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const dateStr = tomorrow.toISOString().slice(0, 10);

    const bookings = await this.bookingRepository.findAll({
      fromDate: dateStr,
      toDate: dateStr,
      status: "Confirmed",
    });

    let reminded = 0;
    for (const booking of bookings) {
      const amenity = await this.amenityRepository.findById(booking.amenityId);
      if (!amenity) continue;
      try {
        await this.notifier.notifyReminder(booking, amenity);
        reminded++;
      } catch (error) {
        console.error("Failed to send booking reminder:", error);
      }
    }
    return { reminded };
  }
}
