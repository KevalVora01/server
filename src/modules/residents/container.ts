import { UserRepository } from "../auth/infrastructure/repositories/UserRepository";
import { BcryptPasswordHasher } from "../auth/infrastructure/services/BcryptPasswordHasher";
import { CreateResidentUseCase } from "./application/use-cases/CreateResidentUseCase";
import { DeactivateResidentUseCase } from "./application/use-cases/DeactivateResidentUseCase";
import { GetResidentUseCase } from "./application/use-cases/GetResidentUseCase";
import { ListResidentsUseCase } from "./application/use-cases/ListResidentsUseCase";
import { ListApartmentTenantsUseCase } from "./application/use-cases/ListApartmentTenantsUseCase";
import { UpdateResidentUseCase } from "./application/use-cases/UpdateResidentUseCase";
import { ImportResidentsUseCase } from "./application/use-cases/ImportResidentsUseCase";
import { PromoteOccupantsJob } from "./application/jobs/PromoteOccupantsJob";
import { ResidentRepository } from "./infrastructure/repositories/ResidentRepository";
import { ResidentController } from "./presentation/controllers/ResidentController";


// Repositories
const residentRepository = new ResidentRepository();
const userRepository = new UserRepository();
const passwordHasher = new BcryptPasswordHasher();

// Use Cases
const createResidentUseCase = new CreateResidentUseCase(
  residentRepository,
  userRepository,
  passwordHasher
);

const getResidentUseCase = new GetResidentUseCase(
  residentRepository
);

const listResidentsUseCase = new ListResidentsUseCase(
  residentRepository
);

const updateResidentUseCase = new UpdateResidentUseCase(
  residentRepository,
  userRepository
);

const deactivateResidentUseCase = new DeactivateResidentUseCase(
  residentRepository,
  userRepository
);

const listApartmentTenantsUseCase = new ListApartmentTenantsUseCase(
  residentRepository
);

const importResidentsUseCase = new ImportResidentsUseCase(
  residentRepository,
  userRepository,
  passwordHasher
);

// Scheduled Job (exported so shared/jobs/scheduler.ts can register it)
export const promoteOccupantsJob = new PromoteOccupantsJob(
  residentRepository
);

// Controller
export const residentController = new ResidentController(
  createResidentUseCase,
  getResidentUseCase,
  listResidentsUseCase,
  updateResidentUseCase,
  deactivateResidentUseCase,
  listApartmentTenantsUseCase,
  residentRepository,
  importResidentsUseCase
);