import { Visitor } from "../../domain/entities/Visitor";
import { IVisitorRepository } from "../../domain/repositories/IVisitorRepository";

export class ListCurrentlyInsideUseCase {
  constructor(private readonly visitorRepository: IVisitorRepository) {}

  async execute(): Promise<Visitor[]> {
    return this.visitorRepository.findCurrentlyInside();
  }
}