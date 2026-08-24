export interface BlackoutProps {
  id?: number;
  amenityId: number;
  date: string;          // "2026-08-25"
  startTime: string;     // "00:00" — can span the full day
  endTime: string;       // "23:59"
  reason: string;
  createdByAdminId: number;
  createdAt?: Date;
}

export class Blackout {
  readonly id?: number;
  readonly amenityId: number;
  readonly date: string;
  readonly startTime: string;
  readonly endTime: string;
  readonly reason: string;
  readonly createdByAdminId: number;
  readonly createdAt: Date;

  constructor(props: BlackoutProps) {
    this.id = props.id;
    this.amenityId = props.amenityId;
    this.date = props.date;
    this.startTime = props.startTime;
    this.endTime = props.endTime;
    this.reason = props.reason;
    this.createdByAdminId = props.createdByAdminId;
    this.createdAt = props.createdAt ?? new Date();
  }

  static create(props: BlackoutProps): Blackout {
    if (!props.reason?.trim()) {
      throw new Error("Blackout reason is required");
    }
    if (props.startTime >= props.endTime) {
      throw new Error("Start time must be before end time");
    }

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const currentTimeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    if (props.date < todayStr) {
      throw new Error("Blackout date cannot be in the past");
    }
    if (props.date === todayStr && props.startTime < currentTimeStr) {
      throw new Error("Blackout start time must be in the future");
    }

    return new Blackout(props);
  }

  overlapsWith(date: string, startTime: string, endTime: string): boolean {
    if (this.date !== date) return false;
    return this.startTime < endTime && startTime < this.endTime;
  }

  toResponseObject() {
    return {
      id: this.id,
      amenityId: this.amenityId,
      date: this.date,
      startTime: this.startTime,
      endTime: this.endTime,
      reason: this.reason,
      createdByAdminId: this.createdByAdminId,
      createdAt: this.createdAt,
    };
  }
}