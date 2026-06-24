import { ApartmentModel } from "../../src/modules/apartments/infrastructure/models/ApartmentModel";
import { ResidentModel } from "../../src/modules/residents/infrastructure/models/ResidentModel";
import { UserModel } from "../../src/modules/auth/infrastructure/models/UserModel";
import { ApartmentType } from "../../src/modules/apartments/domain/entities/Apartment";
import { UserRole } from "../../src/modules/auth/domain/entities/User";
import { BcryptPasswordHasher } from "../../src/modules/auth/infrastructure/services/BcryptPasswordHasher";

const apartments = [
  { block: "A", floorNumber: 1, flateNumber: "A-101", areaSqft: 850,  type: ApartmentType.ONE_BHK },
  { block: "A", floorNumber: 1, flateNumber: "A-102", areaSqft: 1100, type: ApartmentType.TWO_BHK },
  { block: "A", floorNumber: 2, flateNumber: "A-201", areaSqft: 1250, type: ApartmentType.TWO_BHK },
  { block: "A", floorNumber: 2, flateNumber: "A-202", areaSqft: 1500, type: ApartmentType.THREE_BHK },
  { block: "B", floorNumber: 1, flateNumber: "B-101", areaSqft: 600,  type: ApartmentType.STUDIO },
  { block: "B", floorNumber: 1, flateNumber: "B-102", areaSqft: 850,  type: ApartmentType.ONE_BHK },
  { block: "B", floorNumber: 2, flateNumber: "B-201", areaSqft: 1100, type: ApartmentType.TWO_BHK },
  { block: "B", floorNumber: 3, flateNumber: "B-301", areaSqft: 1800, type: ApartmentType.FOUR_BHK },
  { block: "C", floorNumber: 1, flateNumber: "C-101", areaSqft: 950,  type: ApartmentType.ONE_BHK },
  { block: "C", floorNumber: 2, flateNumber: "C-201", areaSqft: 1350, type: ApartmentType.THREE_BHK },
];

const residents = [
  { name: "Rahul Sharma",   email: "rahul@society.com",   phone: "9876543210" },
  { name: "Priya Patel",    email: "priya@society.com",   phone: "9876543211" },
  { name: "Amit Joshi",     email: "amit@society.com",    phone: "9876543212" },
  { name: "Neha Singh",     email: "neha@society.com",    phone: "9876543213" },
  { name: "Ravi Kumar",     email: "ravi@society.com",    phone: "9876543214" },
  { name: "Sunita Mehta",   email: "sunita@society.com",  phone: "9876543215" },
  { name: "Vikram Desai",   email: "vikram@society.com",  phone: "9876543216" },
  { name: "Anjali Gupta",   email: "anjali@society.com",  phone: "9876543217" },
  { name: "Suresh Reddy",   email: "suresh@society.com",  phone: "9876543218" },
  { name: "Kavita Nair",    email: "kavita@society.com",  phone: "9876543219" },
];

export const seedApartmentsAndResidents = async (): Promise<void> => {
  try {
    // ── Apartments ──────────────────────────────────────────────
    const existingApartments = await ApartmentModel.count();
    if (existingApartments > 0) {
      console.log("[Database Seeder]: Apartments already seeded. Skipping.");
    } else {
      console.log("[Database Seeder]: Seeding apartments...");
      const createdApartments = await ApartmentModel.bulkCreate(apartments);
      console.log(`[Database Seeder]: ${createdApartments.length} apartments created.`);
    }

    // ── Resident users + profiles ────────────────────────────────
    const existingResidents = await ResidentModel.count();
    if (existingResidents > 3) {
      console.log("[Database Seeder]: Residents already seeded. Skipping.");
      return;
    }

    console.log("[Database Seeder]: Seeding resident users...");
    const passwordHasher = new BcryptPasswordHasher();
    const hashedPassword = await passwordHasher.hash("Resident@123");

    const allApartments = await ApartmentModel.findAll({ attributes: ["id"] });

    for (let i = 0; i < residents.length; i++) {
      const r = residents[i];

      // check if user already exists
      const existing = await UserModel.findOne({ where: { email: r.email } });
      if (existing) continue;

      // create user
      const user = await UserModel.create({
        name: r.name,
        email: r.email,
        phone: r.phone,
        passwordHash: hashedPassword,
        role: UserRole.RESIDENT,
        isActive: true,
      });

      // assign apartment — cycle through available apartments
      const apartment = allApartments[i % allApartments.length];

      // create resident profile
      await ResidentModel.create({
        userId: user.id,
        apartmentId: apartment.id,
        isOwner: i % 2 === 0, // alternate owner/tenant
        moveInDate: new Date(`2024-0${(i % 9) + 1}-01`),
        isActive: true,
      });

      console.log(`[Database Seeder]: Created resident — ${r.email}`);
    }

    console.log("[Database Seeder]: Residents seeded successfully!");

  } catch (error) {
    console.error("[Database Seeder] CRITICAL: Failed to seed apartments/residents:", error);
  }
};