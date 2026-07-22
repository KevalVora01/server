import type { PaginatedRequest } from "../../../../shared/types/Pagination";

export interface ListApartmentsDto extends PaginatedRequest {
  search?: string;
  type?: string;
  isOccupied?: boolean;
}