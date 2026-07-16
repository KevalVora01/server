import { TenantRequest, TenantRequestStatus } from "../entities/TenantRequest";
import { PaginatedRequest, PaginatedResult } from "../../../../shared/types/Pagination";

export interface ListTenantRequestsFilters extends PaginatedRequest {
  status?: TenantRequestStatus;
  apartmentId?: number;
}

export interface ITenantRequestRepository {
  create(request: TenantRequest): Promise<TenantRequest>;
  findById(id: number): Promise<TenantRequest | null>;
  findAll(filters: ListTenantRequestsFilters): Promise<PaginatedResult<TenantRequest>>;
  findPendingByApartmentId(apartmentId: number): Promise<TenantRequest | null>;
  update(request: TenantRequest): Promise<TenantRequest>;
}