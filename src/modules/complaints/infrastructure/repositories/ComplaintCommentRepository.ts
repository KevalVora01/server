import { IComplaintCommentRepository } from "../../domain/repositories/IComplaintCommentRepository";
import { ComplaintComment } from "../../domain/entities/ComplaintComment";
import { ComplaintCommentModel } from "../models/ComplaintCommentModel";
import { UserModel } from "../../../auth/infrastructure/models/UserModel";

export class ComplaintCommentRepository implements IComplaintCommentRepository {

  private toEntity(model: ComplaintCommentModel): ComplaintComment {
    const comment = new ComplaintComment({
      id: model.id,
      complaintId: model.complaintId,
      userId: model.userId,
      content: model.content,
      createdAt: model.createdAt,
    });

    (comment as any).user = (model as any).user ?? null;
    return comment;
  }

  async create(comment: ComplaintComment): Promise<ComplaintComment> {
    const created = await ComplaintCommentModel.create({
      complaintId: comment.complaintId,
      userId: comment.userId,
      content: comment.content,
    });

    return this.toEntity(created);
  }

  async findByComplaintId(complaintId: number): Promise<ComplaintComment[]> {
    const models = await ComplaintCommentModel.findAll({
      where: { complaintId },
      include: [
        {
          model: UserModel,
          as: "user",
          attributes: ["id", "name"],
        },
      ],
      order: [["createdAt", "ASC"]],
    });

    return models.map((m) => this.toEntity(m));
  }
}