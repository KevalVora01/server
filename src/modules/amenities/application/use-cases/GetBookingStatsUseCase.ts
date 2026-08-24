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
    const [pending, confirmed, rejected, cancelled, all] = await Promise.all([
      this.bookingRepository.countByStatus("Pending"),
      this.bookingRepository.countByStatus("Confirmed"),
      this.bookingRepository.countByStatus("Rejected"),
      this.bookingRepository.countByStatus("Cancelled"),
      this.bookingRepository.findAll(),
    ]);

    const total = pending + confirmed + rejected + cancelled;
    const paid = all.filter((b) => b.isPaid()).length;

    return {
      total,
      pending,
      confirmed,
      rejected,
      cancelled,
      paid,
    };
  }
}
