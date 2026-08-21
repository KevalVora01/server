export interface CreateBookingDto {
  amenityId: number;
  bookingDate: string;
  startTime: string;
  endTime: string;
  purpose?: string | null;
  residentId?: number;
  apartmentId?: number;
}
