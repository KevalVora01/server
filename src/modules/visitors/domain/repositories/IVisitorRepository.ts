import { Visitor, VisitorStatus } from "../entities/Visitor";
import { PaginatedRequest, PaginatedResult } from "../../../../shared/types/Pagination";
import { VisitorDashboardMetrics } from "../../application/use-cases/GetDashboardMetricsUseCase";

export interface ListVisitorsFilters extends PaginatedRequest {
  status?: VisitorStatus;
  apartmentId?: number;
  search?: string;
  loggedOnly?: boolean;
}

export interface IVisitorRepository {
  create(visitor: Visitor): Promise<Visitor>;
  findById(id: number): Promise<Visitor | null>;
  findByNameOrPhone(query: string): Promise<Visitor[]>;
  findAll(filters: ListVisitorsFilters): Promise<PaginatedResult<Visitor>>;
  findByApartmentId(apartmentId: number, pagination: PaginatedRequest, filters?: { status?: VisitorStatus; search?: string }): Promise<PaginatedResult<Visitor>>;
  findCurrentlyInside(): Promise<Visitor[]>;
  findAllExpiredPending(cutoff: Date): Promise<Visitor[]>;
  findAllExpiredExpectedVisits(): Promise<Visitor[]>;
  findAllWithExpiredPhotos(cutoff: Date): Promise<Visitor[]>;
  findAllPreRegisteredApproved(): Promise<Visitor[]>;
  update(visitor: Visitor): Promise<Visitor>;
  delete(id: number): Promise<void>;
  getDashboardMetrics(): Promise<VisitorDashboardMetrics>;
}