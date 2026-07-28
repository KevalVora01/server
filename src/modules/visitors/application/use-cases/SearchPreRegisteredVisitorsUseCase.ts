import { Visitor } from "../../domain/entities/Visitor";
import { IVisitorRepository } from "../../domain/repositories/IVisitorRepository";

export class SearchPreRegisteredVisitorsUseCase {
  constructor(private readonly visitorRepository: IVisitorRepository) {}

  async execute(query: string): Promise<Visitor[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    return this.visitorRepository.findByNameOrPhone(query.trim());
  }
}