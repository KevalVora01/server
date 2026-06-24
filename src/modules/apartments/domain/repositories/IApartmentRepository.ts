import { PaginatedRequest, PaginatedResult } from "../../../../shared/types/Pagination";
import { Apartment } from "../entities/Apartment";

export interface ListApartmentsFilters extends PaginatedRequest {
  block?: string;
  floorNumber?: number;
  type?: string;
}

export interface ApartmentWithOccupancy {
  apartment: Apartment;
  isOccupied: boolean;
}

export interface IApartmentRepository {
  create(apartment: Apartment): Promise<Apartment>;
  findById(id: number): Promise<Apartment | null>;
  findByBlockAndFlateNumber(block: string, flateNumber: string): Promise<Apartment | null>;
  findAll(filters: ListApartmentsFilters): Promise<PaginatedResult<ApartmentWithOccupancy>>;
  update(apartment: Apartment): Promise<Apartment>;
}