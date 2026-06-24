import type { PaginatedRequest } from "../../../../shared/types/Pagination";

export interface ListApartmentsDto extends PaginatedRequest {
  block?: string;
  floorNumber?: number;
  flateNumber?: string;
  type?: string;
}