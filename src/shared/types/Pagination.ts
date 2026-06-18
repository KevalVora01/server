export interface PaginatedRequest {
  pageNumber: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export const buildPaginatedResult = <T>(
  items: T[],
  totalCount: number,
  pageNumber: number,
  pageSize: number
): PaginatedResult<T> => {
  const totalPages = Math.ceil(totalCount / pageSize);
  return {
    items,
    totalCount,
    pageNumber,
    pageSize,
    totalPages,
    hasNextPage: pageNumber < totalPages,
    hasPreviousPage: pageNumber > 1,
  };
};