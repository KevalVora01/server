import { ComplaintComment } from "../../domain/entities/ComplaintComment";
import { IComplaintCommentRepository } from "../../domain/repositories/IComplaintCommentRepository";
import { IComplaintRepository } from "../../domain/repositories/IComplaintRepository";
import { RequestingUser } from "../../../../shared/types/RequestingUser";
import { UserRole } from "../../../auth/domain/entities/User";
import {
  ComplaintNotFoundError,
  UnauthorizedComplaintAccessError,
} from "../../domain/errors/ComplaintErrors";

export class ListCommentsUseCase {
  constructor(
    private readonly complaintRepository: IComplaintRepository,
    private readonly commentRepository: IComplaintCommentRepository
  ) {}

  async execute(complaintId: number, requestingUser: RequestingUser): Promise<ComplaintComment[]> {
    const complaint = await this.complaintRepository.findById(complaintId);

    if (!complaint) {
      throw new ComplaintNotFoundError(complaintId);
    }

    if (
      requestingUser.role === UserRole.RESIDENT &&
      complaint.residentId !== requestingUser.residentId
    ) {
      throw new UnauthorizedComplaintAccessError();
    }

    return this.commentRepository.findByComplaintId(complaintId);
  }
} 