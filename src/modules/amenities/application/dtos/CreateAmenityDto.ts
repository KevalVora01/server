import { AmenityBookingType } from "../../domain/entities/Amenity";

export interface CreateAmenityDto {
  name: string;
  description?: string | null;
  capacity?: number | null;
  operatingStart: string;
  operatingEnd: string;
  price?: number;
  images?: string[];
  bookingType?: AmenityBookingType;
  isActive?: boolean;
}
