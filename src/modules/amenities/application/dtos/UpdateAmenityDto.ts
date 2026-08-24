import { AmenityBookingType } from "../../domain/entities/Amenity";

export interface UpdateAmenityDto {
  name?: string;
  description?: string | null;
  capacity?: number | null;
  operatingStart?: string;
  operatingEnd?: string;
  price?: number;
  images?: string[];
  bookingType?: AmenityBookingType;
  isActive?: boolean;
}
