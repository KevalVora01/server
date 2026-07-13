import { ComplaintComment } from "../../domain/entities/ComplaintComment";
import { IComplaintRepository } from "../../domain/repositories/IComplaintRepository";
import { IComplaintCommentRepository } from "../../domain/repositories/IComplaintCommentRepository";
import { CreateCommentDto } from "../dtos/CreateCommentDto";
import { RequestingUser } from "../../../../shared/types/RequestingUser";
import { UserRole } from "../../../auth/domain/entities/User";
import { IComplaintNotifier } from "../../domain/services/complaint-notifier.interface";
import {
  ComplaintNotFoundError,
  ComplaintAlreadyResolvedError,
  UnauthorizedComplaintAccessError,
} from "../../domain/errors/ComplaintErrors";

export class AddCommentUseCase {
  constructor(
    private readonly complaintRepository: IComplaintRepository,
    private readonly commentRepository: IComplaintCommentRepository,
    private readonly complaintNotifier: IComplaintNotifier
  ) { }

  async execute(dto: CreateCommentDto, requestingUser: RequestingUser): Promise<ComplaintComment> {
    const complaint = await this.complaintRepository.findById(dto.complaintId);

    if (!complaint) {
      throw new ComplaintNotFoundError(dto.complaintId);
    }

    if (
      requestingUser.role === UserRole.RESIDENT &&
      complaint.residentId !== requestingUser.residentId
    ) {
      throw new UnauthorizedComplaintAccessError();
    }

    if (!complaint.canAcceptComments()) {
      throw new ComplaintAlreadyResolvedError();
    }

    const comment = ComplaintComment.create({
      complaintId: dto.complaintId,
      userId: dto.userId,
      content: dto.content,
    });

    const createdComment = await this.commentRepository.create(comment);

    try {
      await this.complaintNotifier.notifyCommentAdded(complaint, comment.content, requestingUser.userId);
    } catch (error) {
      console.error("Failed to notify comment added:", error);
    }

    return createdComment;
  }
}