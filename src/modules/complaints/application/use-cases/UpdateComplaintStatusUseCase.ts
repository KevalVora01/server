import { Complaint } from "../../domain/entities/Complaint";
import { IComplaintRepository } from "../../domain/repositories/IComplaintRepository";
import { UpdateComplaintStatusDto } from "../dtos/UpdateComplaintStatusDto";
import {
  ComplaintNotFoundError,
  ComplaintAlreadyResolvedError,
} from "../../domain/errors/ComplaintErrors";

export class UpdateComplaintStatusUseCase {
  constructor(private readonly complaintRepository: IComplaintRepository) {}

  async execute(dto: UpdateComplaintStatusDto): Promise<Complaint> {
    const complaint = await this.complaintRepository.findById(dto.complaintId);

    if (!complaint) {
      throw new ComplaintNotFoundError(dto.complaintId);
    }

    if (complaint.isResolved()) {
      throw new ComplaintAlreadyResolvedError();
    }

    complaint.updateStatus(dto.status);

    return this.complaintRepository.update(complaint);
  }
}