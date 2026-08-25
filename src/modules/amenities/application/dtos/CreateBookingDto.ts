export interface CreateBookingDto {
  amenityId: number;
  bookingDate: string;
  startTime: string;
  endTime: string;
  memberCount?: number;
  purpose?: string | null;
  residentId?: number;
  apartmentId?: number;
}
