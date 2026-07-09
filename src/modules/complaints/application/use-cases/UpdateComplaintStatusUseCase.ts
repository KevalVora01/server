import { Complaint } from "../../domain/entities/Complaint";
import { IComplaintRepository } from "../../domain/repositories/IComplaintRepository";
import { IComplaintNotifier } from "../../domain/services/complaint-notifier.interface";
import { UpdateComplaintStatusDto } from "../dtos/UpdateComplaintStatusDto";
import {
  ComplaintNotFoundError,
  ComplaintAlreadyResolvedError,
} from "../../domain/errors/ComplaintErrors";

export class UpdateComplaintStatusUseCase {
  constructor(
    private readonly complaintRepository: IComplaintRepository,
    private readonly notifier: IComplaintNotifier
  ) {}

  async execute(dto: UpdateComplaintStatusDto): Promise<Complaint> {
    const complaint = await this.complaintRepository.findById(dto.complaintId);

    if (!complaint) {
      throw new ComplaintNotFoundError(dto.complaintId);
    }

    if (complaint.isResolved()) {
      throw new ComplaintAlreadyResolvedError();
    }

    const oldStatus = complaint.status;
    // Hold onto resident data before update() strips it
    const resident = (complaint as any).resident;

    complaint.updateStatus(dto.status);

    const updated = await this.complaintRepository.update(complaint);

    // Re-attach resident so the notifier can read resident.userId
    if (resident) {
      (updated as any).resident = resident;
    }

    this.notifier.notifyStatusChanged(updated, oldStatus);

    return updated;
  }
}