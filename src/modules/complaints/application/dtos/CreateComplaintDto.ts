import { ComplaintPriority } from "../../domain/entities/Complaint";

export interface CreateComplaintDto {
  residentId: number;
  title: string;
  description: string;
  priority: ComplaintPriority;
  imageUrls?: string[];
}