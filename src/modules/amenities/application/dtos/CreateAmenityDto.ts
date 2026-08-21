export interface CreateAmenityDto {
  name: string;
  description?: string | null;
  capacity?: number | null;
  operatingStart: string;
  operatingEnd: string;
  isActive?: boolean;
}
