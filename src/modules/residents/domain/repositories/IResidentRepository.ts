import { Resident } from "../entities/Resident";
import { PaginatedRequest, PaginatedResult } from "../../../../shared/types/Pagination";

export interface ListResidentsFilters extends PaginatedRequest {
  apartmentId?: number;
  isActive?: boolean;
  isOwner?: boolean;
  search?: string;
}

export interface ResidentStats {
  totalCount: number;
  totalActive: number;
  totalOwners: number;
  totalTenants: number;
}


export interface IResidentRepository {
  create(resident: Resident): Promise<Resident>;
  findById(id: number): Promise<Resident | null>;
  findByUserId(userId: number): Promise<Resident | null>;
  findActiveByApartmentId(apartmentId: number): Promise<Resident | null>;
  findOccupantByApartmentId(apartmentId: number): Promise<Resident | null>;
  findActiveTenantByApartmentId(apartmentId: number): Promise<Resident | null>;
  findTenantsByApartmentId(apartmentId: number): Promise<Resident[]>;
  findCommitteeMembers(): Promise<Resident[]>;
  findAll(filters: ListResidentsFilters): Promise<PaginatedResult<Resident>>;
  findAllActive(): Promise<Resident[]>;
  findActiveOccupantsByApartmentId(apartmentId: number): Promise<Resident[]>;
  update(resident: Resident): Promise<Resident>;
  deactivate(id: number): Promise<void>;
  getStats(): Promise<ResidentStats>;
  promoteDueOccupants(): Promise<number>;
}