import { Visitor } from "../../domain/entities/Visitor";
import { IVisitorRepository } from "../../domain/repositories/IVisitorRepository";
import { IVisitorNotifier } from "../../domain/services/IVisitorNotifier";
import { VisitorNotFoundError, VisitorPhotoRequiredError } from "../../domain/errors/VisitorErrors";

export class CheckInVisitorUseCase {
  constructor(
    private readonly visitorRepository: IVisitorRepository,
    private readonly visitorNotifier: IVisitorNotifier,
  ) { }

  async execute(visitorId: number, securityUserId: number, photoUrl?: string): Promise<Visitor> {
    const visitor = await this.visitorRepository.findById(visitorId);

    if (!visitor) {
      throw new VisitorNotFoundError(visitorId);
    }

    visitor.checkIn(securityUserId);

    if (photoUrl) {
      visitor.setPhoto(photoUrl);
    }

    if (!visitor.photoUrl) {
      throw new VisitorPhotoRequiredError();
    }

    const updated = await this.visitorRepository.update(visitor);

    if (visitor.isPreRegistered) {
      await this.visitorNotifier.notifyPreRegisteredCheckedIn(updated);
    }
    await this.visitorNotifier.notifyVisitorUpdated(updated, "Inside");

    return updated;
  }
}