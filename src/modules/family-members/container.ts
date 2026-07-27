import { FamilyMemberRepository } from "./infrastructure/repositories/FamilyMemberRepository";
import { ResidentRepository } from "../residents/infrastructure/repositories/ResidentRepository";
import { CreateFamilyMemberUseCase } from "./application/use-cases/CreateFamilyMemberUseCase";
import { GetFamilyMembersUseCase } from "./application/use-cases/GetFamilyMembersUseCase";
import { UpdateFamilyMemberUseCase } from "./application/use-cases/UpdateFamilyMemberUseCase";
import { DeleteFamilyMemberUseCase } from "./application/use-cases/DeleteFamilyMemberUseCase";
import { ListApartmentFamilyMembersUseCase } from "./application/use-cases/ListApartmentFamilyMembersUseCase";
import { FamilyMemberController } from "./presentation/controllers/FamilyMemberController";

// Repositories
const familyMemberRepository = new FamilyMemberRepository();
const residentRepository = new ResidentRepository();

// Use Cases
const createFamilyMemberUseCase = new CreateFamilyMemberUseCase(familyMemberRepository, residentRepository);
const getFamilyMembersUseCase = new GetFamilyMembersUseCase(familyMemberRepository, residentRepository);
const updateFamilyMemberUseCase = new UpdateFamilyMemberUseCase(familyMemberRepository);
const deleteFamilyMemberUseCase = new DeleteFamilyMemberUseCase(familyMemberRepository);
const listApartmentFamilyMembersUseCase = new ListApartmentFamilyMembersUseCase(familyMemberRepository, residentRepository);

// Controller
export const familyMemberController = new FamilyMemberController(
  createFamilyMemberUseCase,
  getFamilyMembersUseCase,
  updateFamilyMemberUseCase,
  deleteFamilyMemberUseCase,
  listApartmentFamilyMembersUseCase,
  residentRepository,
);