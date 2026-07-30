export interface RespondToApprovalDto {
  visitorId: number;
  decision: "Approve" | "Reject";
  residentId?: number;
}