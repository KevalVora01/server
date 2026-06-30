import { UserModel } from "../../src/modules/auth/infrastructure/models/UserModel";
import { UserRole } from "../../src/modules/auth/domain/entities/User";
import { BcryptPasswordHasher } from "../../src/modules/auth/infrastructure/services/BcryptPasswordHasher";

export const seedDefaultUsers = async (): Promise<void> => {
  try {
    const userCount = await UserModel.count();

    if (userCount > 0) {
      console.log("[Database Seeder]: Users table already has data. Skipping user seeding.");
      return;
    }

    console.log("[Database Seeder]: Users table is empty. Generating default users...");

    const passwordHasher = new BcryptPasswordHasher();

    const users = [
      {
        name: "System Administrator",
        email: "admin@society.com",
        password: "Admin@123",
        phone: "0000000000",
        role: UserRole.ADMIN,
      },
      // {
      //   name: "Default Resident",
      //   email: "resident@society.com",
      //   password: "Resident@123",
      //   phone: "0000000001", 
      //   role: UserRole.RESIDENT,
      // },
      {
        name: "Security Guard",
        email: "security@society.com",
        password: "Security@123",
        phone: "0000000002",
        role: UserRole.SECURITY,
      },
    ];

    for (const user of users) {
      const hashedPassword = await passwordHasher.hash(user.password);
      await UserModel.create({
        name: user.name,
        email: user.email,
        passwordHash: hashedPassword,
        phone: user.phone,
        role: user.role,
        isActive: true,
      });
      console.log(`[Database Seeder]: Created ${user.role} — ${user.email}`);
    }

    console.log("[Database Seeder]: Default users successfully seeded!");

  } catch (error) {
    console.error("[Database Seeder] CRITICAL: Failed to seed default users:", error);
  }
};