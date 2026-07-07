import { ComplaintComment } from "../entities/ComplaintComment";

export interface IComplaintCommentRepository {
  create(comment: ComplaintComment): Promise<ComplaintComment>;
  findByComplaintId(complaintId: number): Promise<ComplaintComment[]>;
}