import { ComplaintPriority, ComplaintStatus } from "../../domain/entities/Complaint";

export interface ComplaintResponseDto {
  id: number;
  residentId: number;
  title: string;
  description: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt: Date | null;
  images?: string[];
}