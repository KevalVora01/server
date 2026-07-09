import { Complaint } from "../entities/Complaint";

export interface IComplaintNotifier {
  notifyStatusChanged(complaint: Complaint, oldStatus: string): void;
  notifyCreated(complaint: Complaint): Promise<void>;
}
