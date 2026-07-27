import { Notice } from "../entities/Notice";
import { PaginatedRequest, PaginatedResult } from "../../../../shared/types/Pagination";

export interface ListNoticesFilters extends PaginatedRequest {
  category?: string;
  isPinned?: boolean;
  isActive?: boolean;
  search?: string;
}

export interface INoticeRepository {
  create(notice: Notice): Promise<Notice>;
  findById(id: number): Promise<Notice | null>;
  findAll(filters: ListNoticesFilters): Promise<PaginatedResult<Notice>>;
  update(notice: Notice): Promise<Notice>;
  delete(id: number): Promise<void>;
}