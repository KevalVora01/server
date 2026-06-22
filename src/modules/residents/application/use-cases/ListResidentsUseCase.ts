import { IResidentRepository, ListResidentsFilters } from "../../domain/repositories/IResidentRepository";
import { PaginatedResult } from "../../../../shared/types/Pagination";
import { Resident } from "../../domain/entities/Resident";
import { ListResidentsDto } from "../dtos/ListResidentsDto";

export class ListResidentsUseCase {
  constructor(
    private readonly residentRepository: IResidentRepository
  ) {}

  async execute(dto: ListResidentsDto): Promise<PaginatedResult<Resident>> {
    const filters: ListResidentsFilters = {
      pageNumber: dto.pageNumber,
      pageSize: dto.pageSize,
      apartmentId: dto.apartmentId,
      isOwner: dto.isOwner,
      search: dto.search,
      isActive: dto.isActive,
    };

    return this.residentRepository.findAll(filters);
  }
}