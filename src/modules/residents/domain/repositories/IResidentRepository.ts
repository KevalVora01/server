import { Resident } from "../entities/Resident";
import { PaginatedRequest, PaginatedResult } from "../../../../shared/types/Pagination";

export interface ListResidentsFilters extends PaginatedRequest {
  apartmentId?: number;
  isActive?: boolean;
  isOwner?: boolean;
  search?: string;
}

export interface IResidentRepository {
  create(resident: Resident): Promise<Resident>;
  findById(id: number): Promise<Resident | null>;
  findByUserId(userId: number): Promise<Resident | null>;
  findAll(filters: ListResidentsFilters): Promise<PaginatedResult<Resident>>;
  update(resident: Resident): Promise<Resident>;
  deactivate(id: number): Promise<void>;
}