import { seedDefaultUsers } from "./userSeeder";

// Global Database Seeder Entrypoint
 
export const runDatabaseSeeders = async (): Promise<void> => {
  console.log("-----------------------------------------");
  console.log("[Database Seeder]: Initializing data seeding sequence...");
  
  // Run all your seeding scripts sequentially
  await seedDefaultUsers();

  console.log("[Database Seeder]: Seeding sequence complete.");
  console.log("-----------------------------------------");
};