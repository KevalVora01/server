import { Visitor } from "../../domain/entities/Visitor";
import { IVisitorRepository } from "../../domain/repositories/IVisitorRepository";
import { IVisitorNotifier } from "../../domain/services/IVisitorNotifier";
import { RespondToApprovalDto } from "../dtos/RespondToApprovalDto";
import {
  VisitorNotFoundError,
  VisitorNotPendingError,
  UnauthorizedVisitorAccessError,
} from "../../domain/errors/VisitorErrors";

export class RespondToApprovalUseCase {
  constructor(
    private readonly visitorRepository: IVisitorRepository,
    private readonly visitorNotifier?: IVisitorNotifier,
  ) { }

  async execute(dto: RespondToApprovalDto): Promise<Visitor> {
    const visitor = await this.visitorRepository.findById(dto.visitorId);

    if (!visitor) {
      throw new VisitorNotFoundError(dto.visitorId);
    }

    if (dto.residentId && visitor.residentId !== dto.residentId) {
      throw new UnauthorizedVisitorAccessError();
    }

    if (!visitor.isPending()) {
      throw new VisitorNotPendingError();
    }

    if (dto.decision === "Approve") {
      visitor.approve();
    } else {
      visitor.reject();
    }

    const updated = await this.visitorRepository.update(visitor);

    if (this.visitorNotifier) {
      if (dto.decision === "Approve") {
        await this.visitorNotifier.notifyVisitorApproved(updated);
      } else {
        await this.visitorNotifier.notifyVisitorRejected(updated);
      }
    }

    return updated;
  }
}