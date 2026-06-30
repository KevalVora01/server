import { ApartmentType } from "../../domain/entities/Apartment";

export interface UpdateApartmentDto {
  block?: string;
  floorNumber?: number;
  unitNumber?: string;
  areaSqft?: number;
  type?: ApartmentType;
}