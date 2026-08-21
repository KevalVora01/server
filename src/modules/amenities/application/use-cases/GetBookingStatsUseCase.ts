import { IBookingRepository } from "../../domain/repositories/IBookingRepository";

export interface BookingStats {
  total: number;
  pending: number;
  confirmed: number;
  rejected: number;
  cancelled: number;
  paid: number;
}

export class GetBookingStatsUseCase {
  constructor(private readonly bookingRepository: IBookingRepository) {}

  async execute(): Promise<BookingStats> {
    const all = await this.bookingRepository.findAll();
    return {
      total: all.length,
      pending: all.filter((b) => b.status === "Pending").length,
      confirmed: all.filter((b) => b.status === "Confirmed").length,
      rejected: all.filter((b) => b.status === "Rejected").length,
      cancelled: all.filter((b) => b.status === "Cancelled").length,
      paid: all.filter((b) => b.isPaid()).length,
    };
  }
}
