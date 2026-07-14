import { Complaint } from "../entities/Complaint";

export interface IComplaintNotifier {
  notifyStatusChanged(complaint: Complaint, oldStatus: string): Promise<void>;
  notifyCreated(complaint: Complaint): Promise<void>;
  notifyCommentAdded(complaint: Complaint, commentContent: string, senderUserId: number): Promise<void>;
}

