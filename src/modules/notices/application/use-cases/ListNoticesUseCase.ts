import { INoticeRepository, ListNoticesFilters } from "../../domain/repositories/INoticeRepository";
import { Notice } from "../../domain/entities/Notice";
import { PaginatedResult } from "../../../../shared/types/Pagination";

export interface ListNoticesDto {
  pageNumber: number;
  pageSize: number;
  category?: string;
  isPinned?: boolean;
  isActive?: boolean;
  search?: string;
}

export class ListNoticesUseCase {
  constructor(
    private readonly noticeRepository: INoticeRepository,
  ) {}

  async execute(dto: ListNoticesDto): Promise<PaginatedResult<Notice>> {
    const filters: ListNoticesFilters = {
      pageNumber: dto.pageNumber,
      pageSize: dto.pageSize,
      category: dto.category,
      isPinned: dto.isPinned,
      isActive: dto.isActive,
      search: dto.search,
    };

    return await this.noticeRepository.findAll(filters);
  }
}