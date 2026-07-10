import cron from "node-cron";
import { sendMaintenanceRemindersJob } from "../../modules/maintenance/container";

export function initScheduledJobs(): void {
  cron.schedule("0 8 * * *", async () => {
    console.log("Running daily maintenance reminder job...");
    try {
      await sendMaintenanceRemindersJob.execute();
    } catch (err) {
      console.error("Maintenance reminder job failed:", err);
    }
  });
}