import { IComplaintRepository } from "../../domain/repositories/IComplaintRepository";
import { RequestingUser } from "../../../../shared/types/RequestingUser";
import { ComplaintStatus } from "../../domain/entities/Complaint";
import {
  ComplaintNotFoundError,
  UnauthorizedComplaintAccessError,
  ComplaintCannotBeDeletedError,
} from "../../domain/errors/ComplaintErrors";

export class DeleteComplaintUseCase {
  constructor(private readonly complaintRepository: IComplaintRepository) {}

  async execute(id: number, requestingUser: RequestingUser): Promise<void> {
    const complaint = await this.complaintRepository.findById(id);

    if (!complaint) {
      throw new ComplaintNotFoundError(id);
    }

    if (complaint.residentId !== requestingUser.residentId) {
      throw new UnauthorizedComplaintAccessError();
    }

    if (complaint.status !== ComplaintStatus.OPEN) {
      throw new ComplaintCannotBeDeletedError(complaint.status);
    }

    await this.complaintRepository.delete(id);
  }
}
