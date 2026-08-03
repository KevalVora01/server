import { Visitor } from "../../domain/entities/Visitor";
import { IVisitorRepository } from "../../domain/repositories/IVisitorRepository";
import { VisitorNotFoundError, VisitorNotCheckedInError } from "../../domain/errors/VisitorErrors";

export class CheckOutVisitorUseCase {
  constructor(
    private readonly visitorRepository: IVisitorRepository,
  ) {}

  async execute(visitorId: number): Promise<Visitor> {
    const visitor = await this.visitorRepository.findById(visitorId);

    if (!visitor) {
      throw new VisitorNotFoundError(visitorId);
    }

    try {
      visitor.checkOut();
    } catch {
      throw new VisitorNotCheckedInError();
    }

    return this.visitorRepository.update(visitor);
  }
}