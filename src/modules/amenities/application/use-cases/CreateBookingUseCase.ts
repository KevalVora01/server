import { Booking } from "../../domain/entities/Booking";
import { IBookingRepository } from "../../domain/repositories/IBookingRepository";
import { IAmenityRepository } from "../../domain/repositories/IAmenityRepository";
import { IResidentRepository } from "../../../residents/domain/repositories/IResidentRepository";
import { IBookingConflictService } from "../../domain/services/IBookingConflictService";
import { IBookingNotifier } from "../../domain/services/IBookingNotifier";
import { CreateBookingDto } from "../dtos/CreateBookingDto";
import {
  AmenityNotFoundError,
  AmenityNotActiveError,
  ResidentNotFoundError,
} from "../../domain/errors/BookingErrors";
import { RequestingUser } from "../../../../shared/types/RequestingUser";

export class CreateBookingUseCase {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly amenityRepository: IAmenityRepository,
    private readonly residentRepository: IResidentRepository,
    private readonly conflictService: IBookingConflictService,
    private readonly notifier: IBookingNotifier
  ) {}

  async execute(dto: CreateBookingDto, requestingUser?: RequestingUser): Promise<Booking> {
    const residentId = dto.residentId ?? requestingUser?.residentId;
    if (!residentId) throw new ResidentNotFoundError();

    const resident = await this.residentRepository.findById(residentId);
    if (!resident) throw new ResidentNotFoundError();

    const apartmentId = dto.apartmentId ?? resident.apartmentId;
    if (!apartmentId) throw new ResidentNotFoundError();

    const amenity = await this.amenityRepository.findById(dto.amenityId);
    if (!amenity) throw new AmenityNotFoundError();
    if (!amenity.isActive) throw new AmenityNotActiveError();

    await this.conflictService.assertAvailable({
      amenity,
      date: dto.bookingDate,
      startTime: dto.startTime,
      endTime: dto.endTime,
      residentId,
      apartmentId,
    });

    // Shared capacity amenities (Gym, Yoga Studio, Pool) are free and auto-confirmed instantly!
    const initialStatus = amenity.isSharedCapacity ? "Confirmed" : "Pending";

    const booking = new Booking({
      amenityId: amenity.id!,
      apartmentId,
      residentId,
      bookingDate: dto.bookingDate,
      startTime: dto.startTime,
      endTime: dto.endTime,
      purpose: dto.purpose ?? (amenity.isSharedCapacity ? `${amenity.name} Session` : null),
      status: initialStatus,
    });

    const saved = await this.bookingRepository.create(booking);
    if (saved.status === "Confirmed") {
      await this.notifier.notifyConfirmed(saved, amenity);
    } else {
      await this.notifier.notifyRequested(saved, amenity);
    }
    return saved;
  }
}
