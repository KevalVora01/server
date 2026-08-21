import { Op } from "sequelize";
import { IBookingRepository } from "../../domain/repositories/IBookingRepository";
import { Booking, BookingStatus } from "../../domain/entities/Booking";
import { BookingModel } from "../models/BookingModel";

export class BookingRepository implements IBookingRepository {
  private toEntity(model: BookingModel): Booking {
    return new Booking({
      id: model.id,
      amenityId: model.amenityId,
      apartmentId: model.apartmentId,
      residentId: model.residentId,
      bookingDate: model.bookingDate,
      startTime: model.startTime,
      endTime: model.endTime,
      purpose: model.purpose,
      status: model.status,
      rejectionReason: model.rejectionReason,
      cancellationReason: model.cancellationReason,
      approvedBySecurityId: model.approvedBySecurityId,
      paidAt: model.paidAt,
      paymentRef: model.paymentRef,
      createdAt: model.createdAt,
    });
  }

  async create(booking: Booking): Promise<Booking> {
    const created = await BookingModel.create({
      amenityId: booking.amenityId,
      apartmentId: booking.apartmentId,
      residentId: booking.residentId,
      bookingDate: booking.bookingDate,
      startTime: booking.startTime,
      endTime: booking.endTime,
      purpose: booking.purpose,
      status: booking.status,
    });
    return this.toEntity(created);
  }

  async findById(id: number): Promise<Booking | null> {
    const model = await BookingModel.findByPk(id);
    return model ? this.toEntity(model) : null;
  }

  async update(booking: Booking): Promise<Booking> {
    await BookingModel.update(
      {
        amenityId: booking.amenityId,
        apartmentId: booking.apartmentId,
        residentId: booking.residentId,
        bookingDate: booking.bookingDate,
        startTime: booking.startTime,
        endTime: booking.endTime,
        purpose: booking.purpose,
        status: booking.status,
        rejectionReason: booking.rejectionReason,
        cancellationReason: booking.cancellationReason,
        approvedBySecurityId: booking.approvedBySecurityId,
        paidAt: booking.paidAt,
        paymentRef: booking.paymentRef,
      },
      { where: { id: booking.id } }
    );
    const updated = await BookingModel.findByPk(booking.id);
    return this.toEntity(updated!);
  }

  async findOverlapping(
    amenityId: number,
    date: string,
    statuses: BookingStatus[]
  ): Promise<Booking[]> {
    const rows = await BookingModel.findAll({
      where: {
        amenityId,
        bookingDate: date,
        status: { [Op.in]: statuses },
      },
    });
    return rows.map((row) => this.toEntity(row));
  }

  async findByApartment(apartmentId: number): Promise<Booking[]> {
    const rows = await BookingModel.findAll({
      where: { apartmentId },
      order: [["bookingDate", "DESC"], ["startTime", "ASC"]],
    });
    return rows.map((row) => this.toEntity(row));
  }

  async findByResident(residentId: number): Promise<Booking[]> {
    const rows = await BookingModel.findAll({
      where: { residentId },
      order: [["bookingDate", "DESC"], ["startTime", "ASC"]],
    });
    return rows.map((row) => this.toEntity(row));
  }

  async findAll(filters?: {
    amenityId?: number;
    status?: BookingStatus;
    fromDate?: string;
    toDate?: string;
  }): Promise<Booking[]> {
    const where: Record<string, unknown> = {};
    if (filters?.amenityId) where.amenityId = filters.amenityId;
    if (filters?.status) where.status = filters.status;
    if (filters?.fromDate || filters?.toDate) {
      const dateWhere: Record<string | symbol, unknown> = {};
      if (filters.fromDate) dateWhere[Op.gte] = filters.fromDate;
      if (filters.toDate) dateWhere[Op.lte] = filters.toDate;
      where.bookingDate = dateWhere;
    }
    const rows = await BookingModel.findAll({
      where,
      order: [["bookingDate", "DESC"], ["startTime", "ASC"]],
    });
    return rows.map((row) => this.toEntity(row));
  }

  async findUpcomingConfirmed(withinMinutes: number): Promise<Booking[]> {
    const now = new Date();
    const horizon = new Date(now.getTime() + withinMinutes * 60_000);
    const rows = await BookingModel.findAll({
      where: {
        status: "Confirmed",
        bookingDate: {
          [Op.between]: [
            now.toISOString().slice(0, 10),
            horizon.toISOString().slice(0, 10),
          ],
        },
      },
      order: [["bookingDate", "ASC"], ["startTime", "ASC"]],
    });
    return rows.map((row) => this.toEntity(row));
  }

  async countByStatus(status: BookingStatus): Promise<number> {
    return BookingModel.count({ where: { status } });
  }
}
