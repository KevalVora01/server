import { UserModel } from "../../src/modules/auth/infrastructure/models/UserModel";
import { ResidentModel } from "../../src/modules/residents/infrastructure/models/ResidentModel";
import { UserRole } from "../../src/modules/auth/domain/entities/User";

export const seedResidentProfile = async (): Promise<void> => {
  try {
    // find the seeded resident user
    const residentUser = await UserModel.findOne({
      where: { role: UserRole.RESIDENT },
    });

    if (!residentUser) {
      console.log("[Database Seeder]: No resident user found. Skipping resident profile seeding.");
      return;
    }

    // check if resident profile already exists
    const existingResident = await ResidentModel.findOne({
      where: { userId: residentUser.id },
    });

    if (existingResident) {
      console.log("[Database Seeder]: Resident profile already exists. Skipping.");
      return;
    }

    await ResidentModel.create({
      userId: residentUser.id,
      apartmentId: 1, // placeholder until apartments are seeded
      isOwner: true,
      moveInDate: new Date(),
      isActive: true,
    });

    console.log(`[Database Seeder]: Resident profile created for — ${residentUser.email}`);

  } catch (error) {
    console.error("[Database Seeder] CRITICAL: Failed to seed resident profile:", error);
  }
};