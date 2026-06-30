import { UserModel } from "../../src/modules/auth/infrastructure/models/UserModel";
import { ResidentModel } from "../../src/modules/residents/infrastructure/models/ResidentModel";
import { ApartmentModel } from "../../src/modules/apartments/infrastructure/models/ApartmentModel";
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

    // find a vacant apartment to assign
    const occupiedApartmentIds = (
      await ResidentModel.findAll({
        where: { isActive: true },
        attributes: ["apartmentId"],
      })
    ).map((r) => r.apartmentId);

    const vacantApartment = await ApartmentModel.findOne({
      where: occupiedApartmentIds.length > 0
        ? { id: { [require("sequelize").Op.notIn]: occupiedApartmentIds } }
        : {},
      order: [["id", "ASC"]],
    });

    if (!vacantApartment) {
      console.log("[Database Seeder]: No vacant apartment available. Skipping resident profile seeding.");
      return;
    }

    await ResidentModel.create({
      userId: residentUser.id,
      apartmentId: vacantApartment.id,
      isOwner: true,
      moveInDate: new Date(),
      isActive: true,
    });

    console.log(`[Database Seeder]: Resident profile created for — ${residentUser.email}, assigned to apartment ${vacantApartment.id}`);

  } catch (error) {
    console.error("[Database Seeder] CRITICAL: Failed to seed resident profile:", error);
  }
};