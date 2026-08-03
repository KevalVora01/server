import { IVisitorRepository } from "../../domain/repositories/IVisitorRepository";
import { IVisitorNotifier } from "../../domain/services/IVisitorNotifier";
import { getIO } from "../../../../shared/socket/socket.server";
import { Rooms } from "../../../../shared/socket/socket.rooms";
import { SOCKET_EVENTS } from "../../../../shared/socket/socket.events";

const TIMEOUT_MINUTES = 10;

export class AutoRejectExpiredApprovalsJob {
  constructor(
    private readonly visitorRepository: IVisitorRepository,
    private readonly visitorNotifier: IVisitorNotifier,
  ) { }

  async execute(): Promise<void> {
    // 1. Reject pending walk-in approvals exceeding 10 minutes timeout
    const cutoff = new Date(Date.now() - TIMEOUT_MINUTES * 60 * 1000);
    const expiredPending = await this.visitorRepository.findAllExpiredPending(cutoff);

    for (const visitor of expiredPending) {
      visitor.reject();
      await this.visitorRepository.update(visitor);
      await this.visitorNotifier.notifyApprovalTimedOut(visitor);

      // Notify security in real-time
      try {
        getIO().to(Rooms.role("security")).emit(SOCKET_EVENTS.VISITOR_UPDATED, {
          visitorId: visitor.id,
          status: "Rejected",
        });
      } catch { /* socket not initialized */ }
    }

    // 2. Reject pre-registered / expected visitors whose expected visit date has passed
    const expiredExpected = await this.visitorRepository.findAllExpiredExpectedVisits();
    for (const visitor of expiredExpected) {
      visitor.rejectExpiredExpectedVisit();
      await this.visitorRepository.update(visitor);

      try {
        getIO().to(Rooms.role("security")).emit(SOCKET_EVENTS.VISITOR_UPDATED, {
          visitorId: visitor.id,
          status: "Rejected",
        });
      } catch { /* socket not initialized */ }
    }
  }
}