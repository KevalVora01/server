import { Complaint } from "../../domain/entities/Complaint";
import { IComplaintRepository } from "../../domain/repositories/IComplaintRepository";
import { IResidentRepository } from "../../../residents/domain/repositories/IResidentRepository";
import {
  ComplaintNotFoundError,
  UnauthorizedComplaintAccessError,
} from "../../domain/errors/ComplaintErrors";
import { RequestingUser } from "../../../../shared/types/RequestingUser";
import { UserRole } from "../../../auth/domain/entities/User";

export class GetComplaintUseCase {
  constructor(
    private readonly complaintRepository: IComplaintRepository,
    private readonly residentRepository: IResidentRepository,
  ) { }

  async execute(id: number, requestingUser: RequestingUser): Promise<Complaint> {
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

    return complaint;
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