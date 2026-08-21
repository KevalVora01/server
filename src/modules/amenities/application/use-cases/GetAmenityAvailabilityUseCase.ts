import { IBookingRepository } from "../../domain/repositories/IBookingRepository";
import { IBlackoutRepository } from "../../domain/repositories/IBlackoutRepository";
import { IAmenityRepository } from "../../domain/repositories/IAmenityRepository";
import { AmenityNotFoundError } from "../../domain/errors/BookingErrors";

export interface AvailabilitySlot {
  startTime: string;
  endTime: string;
  status?: string;
  bookingId?: number;
  reason?: string;
}

export interface AvailabilityResult {
  amenityId: number;
  date: string;
  bookings: AvailabilitySlot[];
  blackouts: AvailabilitySlot[];
}

export class GetAmenityAvailabilityUseCase {
  constructor(
    private readonly amenityRepository: IAmenityRepository,
    private readonly bookingRepository: IBookingRepository,
    private readonly blackoutRepository: IBlackoutRepository
  ) {}

  async execute(amenityId: number, date: string): Promise<AvailabilityResult> {
    const amenity = await this.amenityRepository.findById(amenityId);
    if (!amenity) throw new AmenityNotFoundError();

    const bookings = await this.bookingRepository.findOverlapping(amenityId, date, [
      "Pending",
      "Confirmed",
    ]);
    const blackouts = await this.blackoutRepository.findByAmenityAndDate(amenityId, date);

    return {
      amenityId,
      date,
      bookings: bookings.map((b) => ({
        startTime: b.startTime,
        endTime: b.endTime,
        status: b.status,
        bookingId: b.id,
      })),
      blackouts: blackouts.map((b) => ({
        startTime: b.startTime,
        endTime: b.endTime,
        reason: b.reason,
      })),
    };
  }
}
