import { Complaint, ComplaintStatus, ComplaintPriority } from "../entities/Complaint";
import { PaginatedRequest, PaginatedResult } from "../../../../shared/types/Pagination";

export interface ListComplaintsFilters extends PaginatedRequest {
  status?: ComplaintStatus;
  priority?: ComplaintPriority;
  residentId?: number;
  search?: string;
}

export interface IComplaintRepository {
  create(complaint: Complaint, imageUrls?: string[]): Promise<Complaint>;
  findById(id: number): Promise<Complaint | null>;
  findAll(filters: ListComplaintsFilters): Promise<PaginatedResult<Complaint>>;
  findByResidentId(residentId: number, filters: ListComplaintsFilters): Promise<PaginatedResult<Complaint>>;
  findTenantComplaintsByApartmentId(apartmentId: number, filters: ListComplaintsFilters): Promise<PaginatedResult<Complaint>>;
  update(complaint: Complaint): Promise<Complaint>;
  delete(id: number): Promise<void>;
}