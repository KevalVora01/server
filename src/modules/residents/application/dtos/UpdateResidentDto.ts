export interface UpdateResidentDto {
  name?: string;
  phone?: string;
  isOwner?: boolean;
  moveOutDate?: Date | string | null;
}