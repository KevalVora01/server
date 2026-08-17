import { IVisitorRepository } from "../../domain/repositories/IVisitorRepository";
import { IVisitorNotifier } from "../../domain/services/IVisitorNotifier";
import {
  VisitorNotFoundError,
  UnauthorizedVisitorAccessError,
} from "../../domain/errors/VisitorErrors";

export class CancelPreRegisteredVisitorUseCase {
  constructor(
    private readonly visitorRepository: IVisitorRepository,
    private readonly visitorNotifier: IVisitorNotifier,
  ) {}

  async execute(visitorId: number, residentId: number): Promise<void> {
    const visitor = await this.visitorRepository.findById(visitorId);

    if (!visitor) {
      throw new VisitorNotFoundError(visitorId);
    }

    if (visitor.residentId !== residentId) {
      throw new UnauthorizedVisitorAccessError();
    }

    if (!visitor.isPreRegistered) {
      throw new Error("Only pre-registered visitors can be cancelled this way");
    }

    if (visitor.checkedInAt) {
      throw new Error("Cannot cancel a visitor who has already checked in");
    }

    visitor.cancel();
    await this.visitorRepository.update(visitor);
    await this.visitorNotifier.notifyVisitorUpdated(visitor, "Cancelled");
  }
}