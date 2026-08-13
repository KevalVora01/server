import cron from "node-cron";
import { sendMaintenanceRemindersJob } from "../../modules/maintenance/container";
import { promoteOccupantsJob } from "../../modules/residents/container";
import { autoRejectExpiredApprovalsJob, deleteExpiredVisitorPhotosJob } from "../../modules/visitors/container";

export function initScheduledJobs(): void {
  // --------------------------------------------------------------------------
  // 1. High Frequency Jobs (Every 1 Minute: * * * * *)
  // --------------------------------------------------------------------------

  // Auto-reject pending walk-in requests (>10m) and visitors past expected date
  cron.schedule("* * * * *", async () => {
    try {
      await autoRejectExpiredApprovalsJob.execute();
    } catch (err) {
      console.error("[Scheduler] Visitor auto-reject job failed:", err);
    }
  });

  // --------------------------------------------------------------------------
  // 2. Daily Jobs (At 12:00 AM Midnight: 0 0 * * *)
  // --------------------------------------------------------------------------

  // Promote approved tenants to active occupants once move-in date arrives
  cron.schedule("0 0 * * *", async () => {
    console.log("[Scheduler] Running occupant promotion job...");
    try {
      await promoteOccupantsJob.execute();
    } catch (err) {
      console.error("[Scheduler] Occupant promotion job failed:", err);
    }
  });

  // Send daily maintenance reminders & apply overdue penalties
  cron.schedule("0 0 * * *", async () => {
    console.log("[Scheduler] Running daily maintenance reminder & penalty job...");
    try {
      await sendMaintenanceRemindersJob.execute();
    } catch (err) {
      console.error("[Scheduler] Maintenance reminder job failed:", err);
    }
  });

  // Cleanup visitor photos older than 30 days from Cloudinary
  cron.schedule("0 0 * * *", async () => {
    console.log("[Scheduler] Running expired visitor photos cleanup job...");
    try {
      await deleteExpiredVisitorPhotosJob.execute();
    } catch (err) {
      console.error("[Scheduler] Visitor photo cleanup job failed:", err);
    }
  });
}