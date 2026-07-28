import { Visitor } from "../../domain/entities/Visitor";
import { IVisitorRepository, ListVisitorsFilters } from "../../domain/repositories/IVisitorRepository";
import { PaginatedResult } from "../../../../shared/types/Pagination";

export class ListVisitorsUseCase {
  constructor(private readonly visitorRepository: IVisitorRepository) {}

  async execute(filters: ListVisitorsFilters): Promise<PaginatedResult<Visitor>> {
    return this.visitorRepository.findAll(filters);
  }
}