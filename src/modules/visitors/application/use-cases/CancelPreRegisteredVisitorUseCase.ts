import { IVisitorRepository } from "../../domain/repositories/IVisitorRepository";
import { IVisitorNotifier } from "../../domain/services/IVisitorNotifier";
import {
  VisitorNotFoundError,
  UnauthorizedVisitorAccessError,
  VisitorNotPreRegisteredError,
  VisitorAlreadyCheckedInError,
} from "../../domain/errors/VisitorErrors";

export class CancelPreRegisteredVisitorUseCase {
  constructor(
    private readonly visitorRepository: IVisitorRepository,
    private readonly visitorNotifier: IVisitorNotifier,
  ) { }

  async execute(visitorId: number, residentId: number): Promise<void> {
    const visitor = await this.visitorRepository.findById(visitorId);

    if (!visitor) {
      throw new VisitorNotFoundError(visitorId);
    }

    if (visitor.residentId !== residentId) {
      throw new UnauthorizedVisitorAccessError();
    }

    if (!visitor.isPreRegistered) {
      throw new VisitorNotPreRegisteredError();
    }

    if (visitor.checkedInAt) {
      throw new VisitorAlreadyCheckedInError();
    }

    visitor.cancel();
    await this.visitorRepository.update(visitor);
    await this.visitorNotifier.notifyVisitorUpdated(visitor, "Cancelled");
  }
}