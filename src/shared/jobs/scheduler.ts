import cron from "node-cron";
import { sendMaintenanceRemindersJob } from "../../modules/maintenance/container";
import { promoteOccupantsJob } from "../../modules/residents/container";
import { autoRejectExpiredApprovalsJob, deleteExpiredVisitorPhotosJob } from "../../modules/visitors/container";

export function initScheduledJobs(): void {
  // Job 1: Sends daily maintenance payment reminders to residents (Daily at 3:00 AM)
  cron.schedule("0 3 * * *", async () => {
    console.log("Running daily maintenance reminder job...");
    try {
      await sendMaintenanceRemindersJob.execute();
    } catch (err) {
      console.error("Maintenance reminder job failed:", err);
    }
  });

  // Job 2: Promotes approved tenants to occupants once move-in date arrives (Hourly)
  cron.schedule("0 * * * *", async () => {
    console.log("Running occupant promotion job...");
    try {
      await promoteOccupantsJob.execute();
    } catch (err) {
      console.error("Occupant promotion job failed:", err);
    }
  });

  // Job 3: Auto-rejects pending walk-ins (>10m) and visitors past expected date (Every 2 minutes)
  cron.schedule("*/2 * * * *", async () => {
    try {
      await autoRejectExpiredApprovalsJob.execute();
    } catch (err) {
      console.error("Visitor auto-reject job failed:", err);
    }
  });

  // Job 4: Deletes visitor photos older than 30 days from Cloudinary (Daily at 3:00 AM)
  cron.schedule("0 3 * * *", async () => {
    console.log("Running expired visitor photos cleanup job...");
    try {
      await deleteExpiredVisitorPhotosJob.execute();
    } catch (err) {
      console.error("Visitor photo cleanup job failed:", err);
    }
  });
}