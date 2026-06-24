import { seedApartmentsAndResidents } from "./apartmentSeeder";
import { seedResidentProfile } from "./residentSeeder";
import { seedDefaultUsers } from "./userSeeder";

// Global Database Seeder Entrypoint
 
export const runDatabaseSeeders = async (): Promise<void> => {
  console.log("-----------------------------------------");
  console.log("[Database Seeder]: Initializing data seeding sequence...");
  
  // Run all your seeding scripts sequentially
  await seedDefaultUsers();
  await seedResidentProfile();
  await seedApartmentsAndResidents();

  console.log("[Database Seeder]: Seeding sequence complete.");
  console.log("-----------------------------------------");
};