import { IApartmentRepository, ListApartmentsFilters, ApartmentWithOccupancy } from "../../domain/repositories/IApartmentRepository";
import type { PaginatedResult } from "../../../../shared/types/Pagination";
import { ListApartmentsDto } from "../dtos/ListApartmentsDto";

export interface ApartmentStats {
  totalOccupied: number;
  totalVacant: number;
}

export interface ApartmentsListResult {
  list: PaginatedResult<ApartmentWithOccupancy>;
  stats: ApartmentStats;
}

export class ListApartmentsUseCase {
  constructor(
    private readonly apartmentRepository: IApartmentRepository
  ) { }

  async execute(dto: ListApartmentsDto): Promise<ApartmentsListResult> {
    const filters: ListApartmentsFilters = {
      pageNumber: dto.pageNumber,
      pageSize: dto.pageSize,
      block: dto.block,
      floorNumber: dto.floorNumber,
      type: dto.type,
    };

    const [list, stats] = await Promise.all([
      this.apartmentRepository.findAll(filters),
      this.apartmentRepository.getStats(),
    ]);

    return { list, stats };
  }
}