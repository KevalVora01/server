import { IResidentRepository, ListResidentsFilters, ResidentStats } from "../../domain/repositories/IResidentRepository";
import { PaginatedResult } from "../../../../shared/types/Pagination";
import { Resident } from "../../domain/entities/Resident";
import { ListResidentsDto } from "../dtos/ListResidentsDto";

export interface ResidentsListResult {
  list: PaginatedResult<Resident>;
  stats: ResidentStats;
}

export class ListResidentsUseCase {
  constructor(
    private readonly residentRepository: IResidentRepository
  ) { }

  async execute(dto: ListResidentsDto): Promise<ResidentsListResult> {
    const filters: ListResidentsFilters = {
      pageNumber: dto.pageNumber,
      pageSize: dto.pageSize,
      apartmentId: dto.apartmentId,
      isOwner: dto.isOwner,
      search: dto.search,
      isActive: dto.isActive,
    };

    const [list, stats] = await Promise.all([
      this.residentRepository.findAll(filters),
      this.residentRepository.getStats(),
    ]);

    return { list, stats };
  }
}