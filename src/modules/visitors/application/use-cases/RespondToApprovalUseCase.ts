import { Visitor } from "../../domain/entities/Visitor";
import { IVisitorRepository } from "../../domain/repositories/IVisitorRepository";
import { RespondToApprovalDto } from "../dtos/RespondToApprovalDto";
import {
  VisitorNotFoundError,
  VisitorNotPendingError,
  UnauthorizedVisitorAccessError,
} from "../../domain/errors/VisitorErrors";

export class RespondToApprovalUseCase {
  constructor(private readonly visitorRepository: IVisitorRepository) { }

  async execute(dto: RespondToApprovalDto): Promise<Visitor> {
    const visitor = await this.visitorRepository.findById(dto.visitorId);

    if (!visitor) {
      throw new VisitorNotFoundError(dto.visitorId);
    }

    if (visitor.residentId !== dto.residentId) {
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

    return this.visitorRepository.update(visitor);
  }
}