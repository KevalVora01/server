import { IComplaintNotifier } from "../../domain/services/complaint-notifier.interface";
import { Complaint } from "../../domain/entities/Complaint";
import { notificationService } from "../../../notifications/container";
import { UserModel } from "../../../auth/infrastructure/models/UserModel";
import { ResidentModel } from "../../../residents/infrastructure/models/ResidentModel";
import { UserRole } from "../../../auth/domain/entities/User";

export class SocketComplaintNotifier implements IComplaintNotifier {
  async notifyStatusChanged(complaint: Complaint, oldStatus: string): Promise<void> {
    try {
      const resident = (complaint as any).resident;
      if (!resident?.userId) return;

      await notificationService.notify(
        resident.userId,
        "complaint_status_changed",
        "Complaint Updated",
        `"${complaint.title}" \u2192 ${complaint.status}`,
        { complaintId: complaint.id, status: complaint.status }
      );
    } catch (err) {
      console.error("Failed to create complaint notification", err);
    }
  }

  async notifyCreated(complaint: Complaint): Promise<void> {
    try {
      const resident = await ResidentModel.findOne({
        where: { id: complaint.residentId },
        include: [{ model: UserModel, as: "user", attributes: ["id", "name"] }],
      });

      const residentName = (resident as any)?.user?.name ?? `Resident #${complaint.residentId}`;

      const admins = await UserModel.findAll({ where: { role: UserRole.ADMIN } });

      await Promise.all(
        admins.map((admin) =>
          notificationService.notify(
            admin.id,
            "complaint_created",
            "New Complaint",
            `${residentName}: ${complaint.title}`,
            { complaintId: complaint.id }
          )
        )
      );
    } catch (err) {
      console.error("Failed to create complaint-created notification", err);
    }
  }
}
