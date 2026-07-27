import { ApartmentType } from "../../domain/entities/Apartment";

export interface CreateApartmentDto {
  block: string;
  floorNumber: number;
  unitNumber: string;
  areaSqft: number;
  type: ApartmentType;
}