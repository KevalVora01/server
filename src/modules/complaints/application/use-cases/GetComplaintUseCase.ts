import { Complaint } from "../../domain/entities/Complaint";
import { ComplaintImage } from "../../domain/entities/ComplaintImage";
import { IComplaintRepository } from "../../domain/repositories/IComplaintRepository";
import {
  ComplaintNotFoundError,
  UnauthorizedComplaintAccessError,
} from "../../domain/errors/ComplaintErrors";
import { RequestingUser } from "../../../../shared/types/RequestingUser";
import { UserRole } from "../../../auth/domain/entities/User";

export interface ComplaintWithImages {
  complaint: Complaint;
  images: ComplaintImage[];
}

export class GetComplaintUseCase {
  constructor(private readonly complaintRepository: IComplaintRepository) {}

  async execute(id: number, requestingUser: RequestingUser): Promise<ComplaintWithImages> {
    const complaint = await this.complaintRepository.findById(id);

    if (!complaint) {
      throw new ComplaintNotFoundError(id);
    }

    if (
      requestingUser.role === UserRole.RESIDENT &&
      complaint.residentId !== requestingUser.residentId
    ) {
      throw new UnauthorizedComplaintAccessError();
    }

    const images = await this.complaintRepository.findImagesByComplaintId(id);

    return { complaint, images };
  }
}