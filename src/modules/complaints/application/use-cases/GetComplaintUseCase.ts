import { Complaint } from "../../domain/entities/Complaint";
import { ComplaintImage } from "../../domain/entities/ComplaintImage";
import { IComplaintRepository } from "../../domain/repositories/IComplaintRepository";
import { IResidentRepository } from "../../../residents/domain/repositories/IResidentRepository";
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
  constructor(
    private readonly complaintRepository: IComplaintRepository,
    private readonly residentRepository: IResidentRepository,
  ) { }

  async execute(id: number, requestingUser: RequestingUser): Promise<ComplaintWithImages> {
    const complaint = await this.complaintRepository.findById(id);

    if (!complaint) {
      throw new ComplaintNotFoundError(id);
    }

    if (requestingUser.role === UserRole.RESIDENT) {
      const isOwnComplaint = complaint.residentId === requestingUser.residentId;

      if (!isOwnComplaint) {
        const isApartmentOwner = await this.isOwnerOfComplaintsApartment(
          requestingUser.residentId,
          complaint.residentId
        );

        if (!isApartmentOwner) {
          throw new UnauthorizedComplaintAccessError();
        }
      }
    }

    const images = await this.complaintRepository.findImagesByComplaintId(id);

    return { complaint, images };
  }

  private async isOwnerOfComplaintsApartment(
    requestingResidentId: number | undefined,
    complaintResidentId: number
  ): Promise<boolean> {
    if (!requestingResidentId) return false;

    const requestingResident = await this.residentRepository.findById(requestingResidentId);
    const complaintAuthor = await this.residentRepository.findById(complaintResidentId);

    if (!requestingResident || !complaintAuthor) return false;

    return (
      requestingResident.isOwner &&
      requestingResident.apartmentId === complaintAuthor.apartmentId
    );
  }
}