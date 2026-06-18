import { PaginatedRequest } from "../../../../shared/types/Pagination";

export interface ListResidentsDto extends PaginatedRequest {
  apartmentId?: number;
  isActive?: boolean;
  isOwner?: boolean;
  search?: string;
}