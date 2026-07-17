import { Invoice, InvoiceStatus } from "../entities/Invoice";
import { AdminDashboardMetrics, ResidentDashboardMetrics } from "../../application/use-cases/GetDashboardMetricsUseCase";
import { PaginatedRequest, PaginatedResult } from "../../../../shared/types/Pagination";

export interface ListInvoicesFilters extends PaginatedRequest {
  status?: InvoiceStatus;
  month?: number;
  year?: number;
  residentId?: number;
  search?: string;
}

export interface IInvoiceRepository {
  create(invoice: Invoice): Promise<Invoice>;
  findById(id: number): Promise<Invoice | null>;
  findAll(filters: ListInvoicesFilters): Promise<PaginatedResult<Invoice>>;
  findByResidentId(residentId: number, pagination: PaginatedRequest): Promise<PaginatedResult<Invoice>>;
  findByApartmentId(apartmentId: number, pagination: PaginatedRequest): Promise<PaginatedResult<Invoice>>;
  findByApartmentForOccupant(residentId: number, pagination: PaginatedRequest): Promise<PaginatedResult<Invoice>>;
  findAllPendingWithDueDate(dueDate: Date): Promise<Invoice[]>;
  findAllNewlyOverdue(today: Date): Promise<Invoice[]>;
  findAllOverdueUnpaid(): Promise<Invoice[]>;
  update(invoice: Invoice): Promise<Invoice>;
  getAdminMetrics(): Promise<AdminDashboardMetrics>;
  getResidentMetrics(residentId: number): Promise<ResidentDashboardMetrics>;
}