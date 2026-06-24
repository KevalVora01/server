import { IApartmentRepository, ListApartmentsFilters, ApartmentWithOccupancy } from "../../domain/repositories/IApartmentRepository";
import type { PaginatedResult } from "../../../../shared/types/Pagination";
import { ListApartmentsDto } from "../dtos/ListApartmentsDto";

export class ListApartmentsUseCase {
  constructor(
    private readonly apartmentRepository: IApartmentRepository
  ) { }

  async execute(dto: ListApartmentsDto): Promise<PaginatedResult<ApartmentWithOccupancy>> {
    const filters: ListApartmentsFilters = {
      pageNumber: dto.pageNumber,
      pageSize: dto.pageSize,
      block: dto.block,
      floorNumber: dto.floorNumber,
      type: dto.type,
    };

    return this.apartmentRepository.findAll(filters);
  }
}