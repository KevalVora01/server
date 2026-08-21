export type BookingStatus = "Pending" | "Confirmed" | "Rejected" | "Cancelled";

export interface BookingProps {
  id?: number;
  amenityId: number;
  apartmentId: number;
  residentId: number;              // who requested the booking
  bookingDate: string;             // "2026-08-25" — the calendar date
  startTime: string;               // "18:00"
  endTime: string;                 // "19:00"
  purpose?: string | null;
  status?: BookingStatus;
  rejectionReason?: string | null;
  cancellationReason?: string | null;
  approvedBySecurityId?: number | null;
  paidAt?: Date | null;
  paymentRef?: string | null;      // UPI ref, only set once paid
  createdAt?: Date;
}

export class Booking {
  readonly id?: number;
  readonly amenityId: number;
  readonly apartmentId: number;
  readonly residentId: number;
  readonly bookingDate: string;
  readonly startTime: string;
  readonly endTime: string;
  purpose: string | null;
  status: BookingStatus;
  rejectionReason: string | null;
  cancellationReason: string | null;
  approvedBySecurityId: number | null;
  paidAt: Date | null;
  paymentRef: string | null;
  readonly createdAt: Date;

  constructor(props: BookingProps) {
    this.id = props.id;
    this.amenityId = props.amenityId;
    this.apartmentId = props.apartmentId;
    this.residentId = props.residentId;
    this.bookingDate = props.bookingDate;
    this.startTime = props.startTime;
    this.endTime = props.endTime;
    this.purpose = props.purpose ?? null;
    this.status = props.status ?? "Pending";
    this.rejectionReason = props.rejectionReason ?? null;
    this.cancellationReason = props.cancellationReason ?? null;
    this.approvedBySecurityId = props.approvedBySecurityId ?? null;
    this.paidAt = props.paidAt ?? null;
    this.paymentRef = props.paymentRef ?? null;
    this.createdAt = props.createdAt ?? new Date();
  }

  static create(props: BookingProps): Booking {
    if (props.startTime >= props.endTime) {
      throw new Error("startTime must be before endTime");
    }
    return new Booking({ ...props, status: "Pending" });
  }

  approve(byUserId: number): void {
    this.ensureStatus("Pending", "approve");
    this.status = "Confirmed";
    this.approvedBySecurityId = byUserId;
  }

  reject(reason: string): void {
    this.ensureStatus("Pending", "reject");
    this.status = "Rejected";
    this.rejectionReason = reason;
  }

  cancel(reason: string): void {
    if (this.status !== "Confirmed" && this.status !== "Pending") {
      throw new Error(`Cannot cancel a booking with status ${this.status}`);
    }
    this.status = "Cancelled";
    this.cancellationReason = reason;
  }

  markPaid(paymentRef: string): void {
    if (this.status !== "Confirmed") {
      throw new Error("Only a Confirmed booking can be paid for");
    }
    if (this.isPaid()) {
      throw new Error("Booking is already paid");
    }
    this.paymentRef = paymentRef;
    this.paidAt = new Date();
  }

  isPaid(): boolean {
    return this.paidAt !== null;
  }

  overlapsWith(startTime: string, endTime: string): boolean {
    return this.startTime < endTime && startTime < this.endTime;
  }

  toResponseObject() {
    return {
      id: this.id,
      amenityId: this.amenityId,
      apartmentId: this.apartmentId,
      residentId: this.residentId,
      bookingDate: this.bookingDate,
      startTime: this.startTime,
      endTime: this.endTime,
      purpose: this.purpose,
      status: this.status,
      rejectionReason: this.rejectionReason,
      cancellationReason: this.cancellationReason,
      approvedBySecurityId: this.approvedBySecurityId,
      paidAt: this.paidAt,
      paymentRef: this.paymentRef,
      createdAt: this.createdAt,
    };
  }

  private ensureStatus(expected: BookingStatus, action: string): void {
    if (this.status !== expected) {
      throw new Error(`Cannot ${action} a booking with status ${this.status}`);
    }
  }
}