import cron from "node-cron";
import { sendMaintenanceRemindersJob } from "../../modules/maintenance/container";
import { promoteOccupantsJob } from "../../modules/residents/container";
import { autoRejectExpiredApprovalsJob, deleteExpiredVisitorPhotosJob } from "../../modules/visitors/container";

export function initScheduledJobs(): void {
  cron.schedule("0 3 * * *", async () => {
    console.log("Running daily maintenance reminder job...");
    try {
      await sendMaintenanceRemindersJob.execute();
    } catch (err) {
      console.error("Maintenance reminder job failed:", err);
    }
  });

  // Promote residents to "occupant" once their move-in date has arrived
  // (covers future-dated tenant approvals) and demote the previous occupant
  // (the owner). Runs hourly so a missed window is recovered the same day
  // rather than depending on the server being alive at a single daily tick.
  cron.schedule("0 * * * *", async () => {
    console.log("Running occupant promotion job...");
    try {
      await promoteOccupantsJob.execute();
    } catch (err) {
      console.error("Occupant promotion job failed:", err);
    }
  });

  // Auto-reject walk-in visitor approval requests the resident never responded to.
  // Runs every 2 minutes since the timeout window itself is only 5–10 minutes —
  // an hourly or daily tick would leave visitors waiting at the gate far too long.
  cron.schedule("*/2 * * * *", async () => {
    try {
      await autoRejectExpiredApprovalsJob.execute();
    } catch (err) {
      console.error("Visitor auto-reject job failed:", err);
    }
  });

  // Delete visitor photos older than 30 days from Cloudinary.
  // Runs daily at 3 AM to clean up storage during low-traffic hours.
  cron.schedule("0 3 * * *", async () => {
    console.log("Running expired visitor photos cleanup job...");
    try {
      await deleteExpiredVisitorPhotosJob.execute();
    } catch (err) {
      console.error("Visitor photo cleanup job failed:", err);
    }
  });
}