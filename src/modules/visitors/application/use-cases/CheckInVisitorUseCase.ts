import { Visitor } from "../../domain/entities/Visitor";
import { IVisitorRepository } from "../../domain/repositories/IVisitorRepository";
import { VisitorNotFoundError, VisitorNotApprovedError } from "../../domain/errors/VisitorErrors";

export class CheckInVisitorUseCase {
  constructor(private readonly visitorRepository: IVisitorRepository) {}

  async execute(visitorId: number, securityUserId: number): Promise<Visitor> {
    const visitor = await this.visitorRepository.findById(visitorId);

    if (!visitor) {
      throw new VisitorNotFoundError(visitorId);
    }

    try {
      visitor.checkIn(securityUserId);
    } catch {
      throw new VisitorNotApprovedError();
    }

    return this.visitorRepository.update(visitor);
  }
}