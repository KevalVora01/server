import { Visitor } from "../entities/Visitor";

export interface IVisitorNotifier {
  notifyApprovalNeeded(visitor: Visitor): Promise<void>;
  notifyApprovalTimedOut(visitor: Visitor): Promise<void>;
  notifyPreRegisteredCheckedIn(visitor: Visitor): Promise<void>;
  notifyVisitorApproved(visitor: Visitor): Promise<void>;
  notifyVisitorRejected(visitor: Visitor): Promise<void>;
  notifyVisitorUpdated(visitor: Visitor, status: string, type?: "pre_registered" | "walk_in"): Promise<void>;
}