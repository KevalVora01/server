
import { UserModel } from "../../src/modules/auth/infrastructure/models/UserModel";
import { ResidentModel } from "../../src/modules/residents/infrastructure/models/ResidentModel";
import { ApartmentModel } from "../../src/modules/apartments/infrastructure/models/ApartmentModel";
import { VehicleModel } from "../../src/modules/vehicles/infrastructure/models/VehicleModel";
import { UserRole } from "../../src/modules/auth/domain/entities/User";
import { ApartmentType } from "../../src/modules/apartments/domain/entities/Apartment";
import { BcryptPasswordHasher } from "../../src/modules/auth/infrastructure/services/BcryptPasswordHasher";
import { VehicleType, FuelType } from "../../src/modules/vehicles/domain/entities/Vehicle";
import { FamilyMemberModel } from "../../src/modules/family-members/infrastructure/models/FamilyMemberModel";
import { NoticeModel } from "../../src/modules/notices/infrastructure/models/NoticeModel";
import { NoticeCategory } from "../../src/modules/notices/domain/entities/Notice";

const apartments = [
  { block: "A", floorNumber: 1, unitNumber: "01", areaSqft: 850, type: ApartmentType.ONE_BHK },
  { block: "A", floorNumber: 1, unitNumber: "02", areaSqft: 1100, type: ApartmentType.TWO_BHK },
  { block: "A", floorNumber: 2, unitNumber: "01", areaSqft: 1250, type: ApartmentType.TWO_BHK },
  { block: "A", floorNumber: 2, unitNumber: "02", areaSqft: 1500, type: ApartmentType.THREE_BHK },
  { block: "B", floorNumber: 1, unitNumber: "01", areaSqft: 600, type: ApartmentType.STUDIO },
  { block: "B", floorNumber: 1, unitNumber: "02", areaSqft: 850, type: ApartmentType.ONE_BHK },
  { block: "B", floorNumber: 2, unitNumber: "01", areaSqft: 1100, type: ApartmentType.TWO_BHK },
  { block: "B", floorNumber: 3, unitNumber: "01", areaSqft: 1800, type: ApartmentType.FOUR_BHK },
  { block: "C", floorNumber: 1, unitNumber: "01", areaSqft: 950, type: ApartmentType.ONE_BHK },
  { block: "C", floorNumber: 2, unitNumber: "01", areaSqft: 1350, type: ApartmentType.THREE_BHK },
];

const residents = [
  { name: "Rahul Sharma", email: "rahul@society.com", phone: "9876543210" },
  { name: "Priya Patel", email: "priya@society.com", phone: "9876543211" },
  { name: "Amit Joshi", email: "amit@society.com", phone: "9876543212" },
  { name: "Neha Singh", email: "neha@society.com", phone: "9876543213" },
  { name: "Ravi Kumar", email: "ravi@society.com", phone: "9876543214" },
  { name: "Sunita Mehta", email: "sunita@society.com", phone: "9876543215" },
  { name: "Vikram Desai", email: "vikram@society.com", phone: "9876543216" },
  { name: "Anjali Gupta", email: "anjali@society.com", phone: "9876543217" },
];

const familyMembers = [
  { residentEmail: "rahul@society.com", name: "Pooja Sharma", relation: "Spouse", age: 30 },
  { residentEmail: "rahul@society.com", name: "Aarav Sharma", relation: "Child", age: 5 },

  { residentEmail: "priya@society.com", name: "Kunal Patel", relation: "Spouse", age: 33 },
  { residentEmail: "priya@society.com", name: "Riya Patel", relation: "Child", age: 7 },

  { residentEmail: "amit@society.com", name: "Suresh Joshi", relation: "Parent", age: 63 },
  { residentEmail: "amit@society.com", name: "Meena Joshi", relation: "Parent", age: 59 },

  { residentEmail: "neha@society.com", name: "Ankit Singh", relation: "Sibling", age: 29 },

  { residentEmail: "ravi@society.com", name: "Sneha Kumar", relation: "Spouse", age: 31 },
  { residentEmail: "ravi@society.com", name: "Vivaan Kumar", relation: "Child", age: 3 },

  { residentEmail: "sunita@society.com", name: "Harish Mehta", relation: "Spouse", age: 38 },
  { residentEmail: "sunita@society.com", name: "Rohan Mehta", relation: "Child", age: 10 },

  { residentEmail: "vikram@society.com", name: "Kokila Desai", relation: "Parent", age: 61 },

  { residentEmail: "anjali@society.com", name: "Nikhil Gupta", relation: "Sibling", age: 27 },
];

const vehicles = [
  { residentEmail: "rahul@society.com", plateNumber: "GJ01AB1234", type: VehicleType.CAR, brandName: "Honda", model: "City", color: "White", fuelType: FuelType.PETROL },
  { residentEmail: "priya@society.com", plateNumber: "GJ02CD5678", type: VehicleType.CAR, brandName: "Maruti", model: "Swift", color: "Red", fuelType: FuelType.PETROL },
  { residentEmail: "amit@society.com", plateNumber: "GJ03EF9012", type: VehicleType.BIKE, brandName: "Royal Enfield", model: "Classic 350", color: "Black", fuelType: FuelType.PETROL },
  { residentEmail: "neha@society.com", plateNumber: "GJ04GH3456", type: VehicleType.SCOOTER, brandName: "Honda", model: "Activa 6G", color: "Blue", fuelType: FuelType.PETROL },
  { residentEmail: "ravi@society.com", plateNumber: "GJ05IJ7890", type: VehicleType.CAR, brandName: "Hyundai", model: "Creta", color: "Silver", fuelType: FuelType.DIESEL },
  { residentEmail: "sunita@society.com", plateNumber: "GJ06KL1234", type: VehicleType.SCOOTER, brandName: "TVS", model: "Jupiter", color: "Green", fuelType: FuelType.PETROL },
  { residentEmail: "vikram@society.com", plateNumber: "GJ07MN5678", type: VehicleType.CAR, brandName: "Toyota", model: "Fortuner", color: "White", fuelType: FuelType.DIESEL },
  { residentEmail: "anjali@society.com", plateNumber: "GJ08OP9012", type: VehicleType.BIKE, brandName: "Bajaj", model: "Pulsar NS200", color: "Orange", fuelType: FuelType.PETROL },
  { residentEmail: "rahul@society.com", plateNumber: "GJ09QR3456", type: VehicleType.BIKE, brandName: "KTM", model: "Duke 390", color: "Black", fuelType: FuelType.PETROL },
  { residentEmail: "priya@society.com", plateNumber: "GJ10ST7890", type: VehicleType.CAR, brandName: "Tata", model: "Nexon EV", color: "Teal", fuelType: FuelType.ELECTRIC },
];

const seedDefaultUsers = async (): Promise<void> => {
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

const seedApartments = async (): Promise<void> => {
  try {
    const existingApartments = await ApartmentModel.count();
    if (existingApartments > 0) {
      console.log("[Database Seeder]: Apartments already seeded. Skipping.");
    } else {
      console.log("[Database Seeder]: Seeding apartments...");
      const createdApartments = await ApartmentModel.bulkCreate(apartments);
      console.log(`[Database Seeder]: ${createdApartments.length} apartments created.`);
    }
  } catch (error) {
    console.error("[Database Seeder] CRITICAL: Failed to seed apartments:", error);
  }
};

const seedResidents = async (): Promise<void> => {
  try {
    const existingResidents = await ResidentModel.count();
    if (existingResidents > 3) {
      console.log("[Database Seeder]: Residents already seeded. Skipping.");
      return;
    }

    console.log("[Database Seeder]: Seeding resident users...");
    const passwordHasher = new BcryptPasswordHasher();
    const hashedPassword = await passwordHasher.hash("Resident@123");

    const allApartments = await ApartmentModel.findAll({
      attributes: ["id"],
      order: [["id", "ASC"]],
    });

    for (let i = 0; i < residents.length; i++) {
      const r = residents[i];

      const existing = await UserModel.findOne({ where: { email: r.email } });
      if (existing) continue;

      const user = await UserModel.create({
        name: r.name,
        email: r.email,
        phone: r.phone,
        passwordHash: hashedPassword,
        role: UserRole.RESIDENT,
        isActive: true,
      });

      const apartment = allApartments[i];

      const month = String((i % 12) + 1).padStart(2, '0');

      await ResidentModel.create({
        userId: user.id,
        apartmentId: apartment.id,
        isOwner: i % 2 === 0,
        moveInDate: new Date(`2024-${month}-01`),
        isActive: true,
      });

      console.log(`[Database Seeder]: Created resident — ${r.email}`);
    }

    console.log("[Database Seeder]: Residents seeded successfully!");

  } catch (error) {
    console.error("[Database Seeder] CRITICAL: Failed to seed residents:", error);
  }
};

const seedFamilyMembers = async (): Promise<void> => {
  try {
    const existing = await FamilyMemberModel.count();

    if (existing > 0) {
      console.log("[Database Seeder]: Family members already seeded. Skipping.");
      return;
    }

    console.log("[Database Seeder]: Seeding family members...");

    for (const member of familyMembers) {
      const user = await UserModel.findOne({
        where: { email: member.residentEmail },
      });

      if (!user) {
        console.log(
          `[Database Seeder]: User ${member.residentEmail} not found. Skipping ${member.name}.`
        );
        continue;
      }

      const resident = await ResidentModel.findOne({
        where: { userId: user.id },
      });

      if (!resident) {
        console.log(
          `[Database Seeder]: Resident profile for ${member.residentEmail} not found.`
        );
        continue;
      }

      await FamilyMemberModel.create({
        residentId: resident.id,
        name: member.name,
        relation: member.relation,
        age: member.age,
      });

      console.log(
        `[Database Seeder]: Created family member ${member.name} for ${member.residentEmail}`
      );
    }

    console.log("[Database Seeder]: Family members seeded successfully!");
  } catch (error) {
    console.error(
      "[Database Seeder] CRITICAL: Failed to seed family members:",
      error
    );
  }
};

const seedVehicles = async (): Promise<void> => {
  try {
    const existingVehicles = await VehicleModel.count();
    if (existingVehicles > 0) {
      console.log("[Database Seeder]: Vehicles already seeded. Skipping.");
      return;
    }

    console.log("[Database Seeder]: Seeding vehicles...");

    for (const v of vehicles) {
      const user = await UserModel.findOne({ where: { email: v.residentEmail } });
      if (!user) {
        console.log(`[Database Seeder]: User ${v.residentEmail} not found. Skipping vehicle ${v.plateNumber}.`);
        continue;
      }

      const resident = await ResidentModel.findOne({ where: { userId: user.id } });
      if (!resident) {
        console.log(`[Database Seeder]: Resident profile for ${v.residentEmail} not found. Skipping vehicle ${v.plateNumber}.`);
        continue;
      }

      await VehicleModel.create({
        residentId: resident.id,
        plateNumber: v.plateNumber,
        type: v.type,
        brandName: v.brandName,
        model: v.model,
        color: v.color,
        fuelType: v.fuelType,
        isActive: true,
      });

      console.log(`[Database Seeder]: Created vehicle ${v.plateNumber} for ${v.residentEmail}`);
    }

    console.log("[Database Seeder]: Vehicles seeded successfully!");

  } catch (error) {
    console.error("[Database Seeder] CRITICAL: Failed to seed vehicles:", error);
  }
};

const notices = [
  {
    title: "Annual Maintenance Notice",
    body: "The society's annual maintenance is scheduled for June 15th. All residents are requested to cooperate with the maintenance team. Water supply will be affected between 10 AM and 4 PM on that day.",
    category: NoticeCategory.MAINTENANCE,
    isPinned: true,
  },
  {
    title: "Diwali Celebration - Save the Date",
    body: "We are pleased to announce the Diwali celebration event on November 10th in the society clubhouse. There will be a lamp-lighting ceremony, cultural performances, and dinner. Please register your participation at the security desk by November 5th.",
    category: NoticeCategory.EVENT,
    isPinned: true,
  },
  {
    title: "Emergency Generator Test",
    body: "The emergency generator will be tested on the first Saturday of every month between 2 PM and 3 PM. During this time, there may be a brief power interruption lasting no more than 5 minutes. We apologize for any inconvenience.",
    category: NoticeCategory.EMERGENCY,
    isPinned: false,
  },
  {
    title: "Waste Segregation Guidelines",
    body: "As per the new municipal regulations, all residents are requested to segregate waste into wet, dry, and hazardous categories. Green bins are for wet waste, blue bins for dry waste. Please ensure compliance to avoid penalties to the society.",
    category: NoticeCategory.GENERAL,
    isPinned: false,
  },
  {
    title: "Clubhouse Booking Policy Updated",
    body: "The clubhouse booking policy has been updated. Residents can now book the clubhouse for a maximum of 4 hours per slot. A refundable security deposit of ₹5,000 is required at the time of booking. Please refer to the notice board for the full policy document.",
    category: NoticeCategory.GENERAL,
    isPinned: false,
  },
  {
    title: "Rainwater Harvesting System Maintenance",
    body: "The rainwater harvesting system will undergo annual maintenance from July 10th to July 12th. Please ensure that terrace access is clear and that no construction debris is present near the rainwater inlets.",
    category: NoticeCategory.MAINTENANCE,
    isPinned: false,
  },
  {
    title: "Yoga & Wellness Camp",
    body: "A free yoga and wellness camp will be organized in the society garden every Sunday morning from 6 AM to 7 AM starting next month. Certified yoga instructors will guide the sessions. All age groups are welcome. Please bring your own yoga mats.",
    category: NoticeCategory.EVENT,
    isPinned: false,
  },
  {
    title: "Fire Safety Drill",
    body: "A mandatory fire safety drill will be conducted on March 20th at 11 AM. All residents must participate. The drill will include evacuation procedures, fire extinguisher usage demonstration, and emergency assembly point briefing.",
    category: NoticeCategory.EMERGENCY,
    isPinned: true,
  },
];

const seedNotices = async (): Promise<void> => {
  try {
    const existingNotices = await NoticeModel.count();
    if (existingNotices > 0) {
      console.log("[Database Seeder]: Notices already seeded. Skipping.");
      return;
    }

    console.log("[Database Seeder]: Seeding notices...");

    const adminUser = await UserModel.findOne({
      where: { email: "admin@society.com" },
    });

    if (!adminUser) {
      console.log("[Database Seeder]: Admin user not found. Skipping notice seeding.");
      return;
    }

    for (const n of notices) {
      await NoticeModel.create({
        adminId: adminUser.id,
        title: n.title,
        body: n.body,
        category: n.category,
        isPinned: n.isPinned,
        isActive: true,
        publishedAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`[Database Seeder]: Created notice — "${n.title}"`);
    }

    console.log("[Database Seeder]: Notices seeded successfully!");
  } catch (error) {
    console.error("[Database Seeder] CRITICAL: Failed to seed notices:", error);
  }
};

export const runDatabaseSeeders = async (): Promise<void> => {
  console.log("-----------------------------------------");
  console.log("[Database Seeder]: Initializing data seeding sequence...");

  await seedDefaultUsers();
  await seedApartments();
  await seedResidents();
  await seedFamilyMembers();
  await seedVehicles();
  await seedNotices();

  console.log("[Database Seeder]: Seeding sequence complete.");
  console.log("-----------------------------------------");
};
