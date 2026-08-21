import { IBookingRepository } from "../../domain/repositories/IBookingRepository";
import { IBlackoutRepository } from "../../domain/repositories/IBlackoutRepository";
import { IAmenityRepository } from "../../domain/repositories/IAmenityRepository";
import { AmenityNotFoundError } from "../../domain/errors/BookingErrors";

export type SlotStatus = "free" | "booked" | "blackout" | "closed";

export interface AvailabilitySlot {
  start: string;
  end: string;
  status: SlotStatus;
}

export interface AvailabilityResult {
  amenityId: number;
  date: string;
  operatingStart: string;
  operatingEnd: string;
  slots: AvailabilitySlot[];
}

const toMinutes = (t: string): number => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

const fromMinutes = (min: number): string => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

const overlaps = (s1: number, e1: number, s2: number, e2: number): boolean =>
  s1 < e2 && s2 < e1;

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

    const open = toMinutes(amenity.operatingStart);
    const close = toMinutes(amenity.operatingEnd);
    const slots: AvailabilitySlot[] = [];

    for (let start = open; start < close; start += 30) {
      const end = start + 30;
      let status: SlotStatus = "free";
      if (blackouts.some((b) => overlaps(start, end, toMinutes(b.startTime), toMinutes(b.endTime)))) {
        status = "blackout";
      } else if (bookings.some((b) => overlaps(start, end, toMinutes(b.startTime), toMinutes(b.endTime)))) {
        status = "booked";
      }
      slots.push({ start: fromMinutes(start), end: fromMinutes(end), status });
    }

    return {
      amenityId,
      date,
      operatingStart: amenity.operatingStart,
      operatingEnd: amenity.operatingEnd,
      slots,
    };
  }
}
