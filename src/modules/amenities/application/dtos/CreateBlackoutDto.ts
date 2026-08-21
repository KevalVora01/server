export interface CreateBlackoutDto {
  amenityId: number;
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
  createdByAdminId: number;
}
