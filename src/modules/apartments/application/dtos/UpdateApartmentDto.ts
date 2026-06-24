import { ApartmentType } from "../../domain/entities/Apartment";

export interface UpdateApartmentDto {
  block?: string;
  floorNumber?: number;
  flateNumber?: string;
  areaSqft?: number;
  type?: ApartmentType;
}