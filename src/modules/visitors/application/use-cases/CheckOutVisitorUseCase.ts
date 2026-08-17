import { Visitor } from "../../domain/entities/Visitor";
import { IVisitorRepository } from "../../domain/repositories/IVisitorRepository";
import { IVisitorNotifier } from "../../domain/services/IVisitorNotifier";
import { VisitorNotFoundError, VisitorNotCheckedInError } from "../../domain/errors/VisitorErrors";

export class CheckOutVisitorUseCase {
  constructor(
    private readonly visitorRepository: IVisitorRepository,
    private readonly visitorNotifier: IVisitorNotifier,
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

    const updated = await this.visitorRepository.update(visitor);
    await this.visitorNotifier.notifyVisitorUpdated(updated, "CheckedOut");

    return updated;
  }
}