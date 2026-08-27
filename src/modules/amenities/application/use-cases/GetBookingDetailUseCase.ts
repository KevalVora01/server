import { IBookingRepository } from "../../domain/repositories/IBookingRepository";
import { IBookingVoteRepository } from "../../domain/repositories/IBookingVoteRepository";
import { IAmenityRepository } from "../../domain/repositories/IAmenityRepository";
import { BookingNotFoundError } from "../../domain/errors/BookingErrors";
import { Booking } from "../../domain/entities/Booking";
import { BookingVote } from "../../domain/entities/BookingVote";
import { Amenity } from "../../domain/entities/Amenity";
import { ResidentModel } from "../../../residents/infrastructure/models/ResidentModel";
import { UserModel } from "../../../auth/infrastructure/models/UserModel";
import { ApartmentModel } from "../../../apartments/infrastructure/models/ApartmentModel";

export interface CommitteeMemberDto {
  id: number;
  fullName: string;
  email: string;
  apartmentId: number;
}

export interface BookingDetailResult {
  booking: Booking;
  amenity: Amenity | null;
  resident: Record<string, unknown> | null;
  votes: BookingVote[];
  committeeMembers: CommitteeMemberDto[];
}

export class GetBookingDetailUseCase {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly bookingVoteRepository: IBookingVoteRepository,
    private readonly amenityRepository: IAmenityRepository
  ) {}

  async execute(bookingId: number): Promise<BookingDetailResult> {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) throw new BookingNotFoundError();

    const amenity = await this.amenityRepository.findById(booking.amenityId);

    const residentModel = await ResidentModel.findByPk(booking.residentId, {
      include: [
        { model: UserModel, as: "user", attributes: ["id", "name", "email", "phone"] },
        { model: ApartmentModel, as: "apartment", attributes: ["id", "block", "floorNumber", "unitNumber"] },
      ],
    });

    const votes = await this.bookingVoteRepository.findByBookingId(bookingId);

    const committeeRows = await ResidentModel.findAll({
      where: { isCommitteeMember: true },
      attributes: ["id", "apartmentId"],
      include: [
        { model: UserModel, as: "user", attributes: ["id", "name", "email"], required: false },
      ],
    });

    const committeeMembers: CommitteeMemberDto[] = committeeRows.map((m) => {
      const row = m as unknown as Record<string, unknown>;
      const user = (row.user ?? {}) as Record<string, unknown>;
      return {
        id: m.id,
        fullName: (user.name as string) ?? `Member #${m.id}`,
        email: (user.email as string) ?? "",
        apartmentId: m.apartmentId,
      };
    });

    return {
      booking,
      amenity,
      resident: residentModel ? (residentModel.toJSON() as unknown as Record<string, unknown>) : null,
      votes,
      committeeMembers,
    };
  }
}
