import cron from "node-cron";
import { sendMaintenanceRemindersJob } from "../../modules/maintenance/container";
import { promoteOccupantsJob } from "../../modules/residents/container";

export function initScheduledJobs(): void {
  cron.schedule("0 8 * * *", async () => {
    console.log("Running daily maintenance reminder job...");
    try {
      await sendMaintenanceRemindersJob.execute();
    } catch (err) {
      console.error("Maintenance reminder job failed:", err);
    }
  });

  // Promote residents to "occupant" once their move-in date has arrived
  // (covers future-dated tenant approvals). Runs daily at 00:05.
  cron.schedule("5 0 * * *", async () => {
    console.log("Running occupant promotion job...");
    try {
      await promoteOccupantsJob.execute();
    } catch (err) {
      console.error("Occupant promotion job failed:", err);
    }
  });
}