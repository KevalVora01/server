import { IBookingRepository } from "../../domain/repositories/IBookingRepository";
import { IBlackoutRepository } from "../../domain/repositories/IBlackoutRepository";
import { IAmenityRepository } from "../../domain/repositories/IAmenityRepository";
import { AmenityNotFoundError } from "../../domain/errors/BookingErrors";
import { AmenityBookingType } from "../../domain/entities/Amenity";

export type SlotStatus = "free" | "booked" | "blackout" | "closed";

export interface AvailabilitySlot {
  start: string;
  end: string;
  status: SlotStatus;
}

export interface BusyInterval {
  id?: number;
  startTime: string;
  endTime: string;
  type: "booking" | "blackout";
  status?: string;
  label?: string;
  memberCount?: number;
}

export interface SharedCapacitySlot {
  startTime: string;
  endTime: string;
  totalCapacity: number;
  currentOccupancy: number;
  availableSpots: number;
  occupancyPercent: number;
  isBlackout: boolean;
  blackoutReason?: string;
  status: "Available" | "Moderate" | "Almost Full" | "Full" | "Blackout";
  isAvailable: boolean;
}

export interface CurrentCrowdStats {
  currentHourSlot: string;
  currentOccupancy: number;
  totalCapacity: number;
  availableSpots: number;
  crowdLevel: "Quiet" | "Moderate" | "Busy" | "Full" | "Closed";
}

export interface AvailabilityResult {
  amenityId: number;
  date: string;
  operatingStart: string;
  operatingEnd: string;
  bookingType: AmenityBookingType;
  totalCapacity: number;
  slots: AvailabilitySlot[];
  busyIntervals: BusyInterval[];
  sharedSlots?: SharedCapacitySlot[];
  currentCrowdNow?: CurrentCrowdStats;
}

const toMinutes = (t: string): number => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
  };

const fromMinutes = (min: number): string => {
  const h = Math.floor(min / 60);
  const minPart = min % 60;
  return `${String(h).padStart(2, "0")}:${String(minPart).padStart(2, "0")}`;
};

const overlaps = (s1: number, e1: number, s2: number, e2: number): boolean =>
  s1 < e2 && s2 < e1;

export class GetAmenityAvailabilityUseCase {
  constructor(
    private readonly amenityRepository: IAmenityRepository,
    private readonly bookingRepository: IBookingRepository,
    private readonly blackoutRepository: IBlackoutRepository
  ) { }

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
    const totalCapacity = amenity.capacity && amenity.capacity > 0 ? amenity.capacity : 25;

    const slots: AvailabilitySlot[] = [];

    // Standard 30-min intervals
    for (let start = open; start < close; start += 30) {
      const end = start + 30;
      let status: SlotStatus = "free";
      if (blackouts.some((b) => overlaps(start, end, toMinutes(b.startTime), toMinutes(b.endTime)))) {
        status = "blackout";
      } else if (bookings.some((b) => overlaps(start, end, toMinutes(b.startTime), toMinutes(b.endTime)))) {
        if (!amenity.isSharedCapacity) {
          status = "booked";
        } else {
          // Count total persons booked for shared capacity
          const count = bookings
            .filter((b) => overlaps(start, end, toMinutes(b.startTime), toMinutes(b.endTime)))
            .reduce((sum, b) => sum + (b.memberCount || 1), 0);
          status = count >= totalCapacity ? "booked" : "free";
        }
      }
      slots.push({ start: fromMinutes(start), end: fromMinutes(end), status });
    }

    const busyIntervals: BusyInterval[] = [
      ...bookings.map((b) => ({
        id: b.id,
        startTime: b.startTime,
        endTime: b.endTime,
        type: "booking" as const,
        status: b.status,
        memberCount: b.memberCount,
        label: b.purpose
          ? b.memberCount && b.memberCount > 1
            ? `${b.purpose} (${b.memberCount} Persons)`
            : b.purpose
          : b.memberCount && b.memberCount > 1
          ? `Booking (${b.memberCount} Persons)`
          : "Private Booking",
      })),
      ...blackouts.map((bl) => ({
        id: bl.id,
        startTime: bl.startTime,
        endTime: bl.endTime,
        type: "blackout" as const,
        label: bl.reason ? bl.reason : "Maintenance Blackout",
      })),
    ].sort((a, b) => a.startTime.localeCompare(b.startTime));

    // Shared Capacity 1-hour slots
    let sharedSlots: SharedCapacitySlot[] | undefined = undefined;
    let currentCrowdNow: CurrentCrowdStats | undefined = undefined;

    if (amenity.isSharedCapacity) {
      sharedSlots = [];
      const now = new Date();
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      const isToday = date === todayStr;
      const currentMinutesNow = now.getHours() * 60 + now.getMinutes();

      for (let start = open; start < close; start += 60) {
        const end = Math.min(close, start + 60);
        const startStr = fromMinutes(start);
        const endStr = fromMinutes(end);

        const activeBlackout = blackouts.find((bl) =>
          overlaps(start, end, toMinutes(bl.startTime), toMinutes(bl.endTime))
        );
        const isBlackout = !!activeBlackout;

        const overlappingBookings = bookings.filter((b) =>
          overlaps(start, end, toMinutes(b.startTime), toMinutes(b.endTime))
        );
        const currentOccupancy = overlappingBookings.reduce(
          (sum, b) => sum + (b.memberCount || 1),
          0
        );
        const availableSpots = Math.max(0, totalCapacity - currentOccupancy);
        const occupancyPercent = Math.min(100, Math.round((currentOccupancy / totalCapacity) * 100));

        let status: SharedCapacitySlot["status"] = "Available";
        if (isBlackout) {
          status = "Blackout";
        } else if (availableSpots <= 0) {
          status = "Full";
        } else if (occupancyPercent >= 80) {
          status = "Almost Full";
        } else if (occupancyPercent >= 40) {
          status = "Moderate";
        }

        sharedSlots.push({
          startTime: startStr,
          endTime: endStr,
          totalCapacity,
          currentOccupancy,
          availableSpots,
          occupancyPercent,
          isBlackout,
          blackoutReason: activeBlackout?.reason,
          status,
          isAvailable: !isBlackout && availableSpots > 0,
        });

        // Compute Live Crowd Stats for right now if slot covers current time
        if (isToday && currentMinutesNow >= start && currentMinutesNow < end) {
          let crowdLevel: CurrentCrowdStats["crowdLevel"] = "Quiet";
          if (isBlackout) crowdLevel = "Closed";
          else if (availableSpots <= 0) crowdLevel = "Full";
          else if (occupancyPercent >= 75) crowdLevel = "Busy";
          else if (occupancyPercent >= 35) crowdLevel = "Moderate";

          currentCrowdNow = {
            currentHourSlot: `${startStr} – ${endStr}`,
            currentOccupancy,
            totalCapacity,
            availableSpots,
            crowdLevel,
          };
        }
      }
    }

    return {
      amenityId,
      date,
      operatingStart: amenity.operatingStart,
      operatingEnd: amenity.operatingEnd,
      bookingType: amenity.bookingType,
      totalCapacity,
      slots,
      busyIntervals,
      sharedSlots,
      currentCrowdNow,
    };
  }
}
