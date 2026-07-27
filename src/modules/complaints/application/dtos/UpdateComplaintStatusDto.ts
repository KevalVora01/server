import { ComplaintStatus } from "../../domain/entities/Complaint";

export interface UpdateComplaintStatusDto {
  complaintId: number;
  status: ComplaintStatus;
}