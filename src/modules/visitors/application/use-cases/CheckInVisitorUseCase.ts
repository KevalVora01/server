import { Visitor } from "../../domain/entities/Visitor";
import { IVisitorRepository } from "../../domain/repositories/IVisitorRepository";
import { IVisitorNotifier } from "../../domain/services/IVisitorNotifier";
import { VisitorNotFoundError, VisitorNotApprovedError } from "../../domain/errors/VisitorErrors";

export class CheckInVisitorUseCase {
  constructor(
    private readonly visitorRepository: IVisitorRepository,
    private readonly visitorNotifier?: IVisitorNotifier,
  ) {}

  async execute(visitorId: number, securityUserId: number, photoUrl?: string): Promise<Visitor> {
    const visitor = await this.visitorRepository.findById(visitorId);

    if (!visitor) {
      throw new VisitorNotFoundError(visitorId);
    }

    try {
      visitor.checkIn(securityUserId);
    } catch {
      throw new VisitorNotApprovedError();
    }

    if (photoUrl) {
      visitor.setPhoto(photoUrl);
    }

    const updated = await this.visitorRepository.update(visitor);

    if (this.visitorNotifier && visitor.isPreRegistered) {
      await this.visitorNotifier.notifyPreRegisteredCheckedIn(updated);
    }

    return updated;
  }
}