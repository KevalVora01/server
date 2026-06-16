import { UserModel } from "../../src/modules/auth/infrastructure/models/UserModel";
import { UserRole } from "../../src/modules/auth/domain/entities/User";
import { BcryptPasswordHasher } from "../../src/modules/auth/infrastructure/services/BcryptPasswordHasher";

// Seeds a default Admin user if the users table is completely empty.

export const seedAdminUser = async (): Promise<void> => {
  try {
    const userCount = await UserModel.count();

    if (userCount > 0) {
      console.log("[Database Seeder]: Users table already has data. Skipping user seeding.");
      return;
    }

    console.log("[Database Seeder]: Users table is empty. Generating default admin user...");

    const passwordHasher = new BcryptPasswordHasher();
    const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || "Admin@123"; 
    const hashedPassword = await passwordHasher.hash(defaultPassword);

    await UserModel.create({
      name: "System Administrator",
      email: process.env.DEFAULT_ADMIN_EMAIL || "admin@society.com",
      passwordHash: hashedPassword,
      phone: "0000000000",
      role: UserRole.ADMIN,
      isActive: true,
    });

    console.log(`[Database Seeder]: Default admin user successfully created!`);
    console.log(`[Database Seeder]: Email: ${process.env.DEFAULT_ADMIN_EMAIL || "admin@society.com"}`);

  } catch (error) {
    console.error("[Database Seeder] CRITICAL: Failed to seed default admin user:", error);
  }
};