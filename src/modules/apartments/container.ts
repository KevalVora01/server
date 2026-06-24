import { ApartmentRepository } from "./infrastructure/repositories/ApartmentRepository";
import { CreateApartmentUseCase } from "./application/use-cases/CreateApartmentUseCase";
import { GetApartmentUseCase } from "./application/use-cases/GetApartmentUseCase";
import { ListApartmentsUseCase } from "./application/use-cases/ListApartmentsUseCase";
import { UpdateApartmentUseCase } from "./application/use-cases/UpdateApartmentUseCase";
import { ApartmentController } from "./presentation/controllers/ApartmentController";

// Repositories
const apartmentRepository = new ApartmentRepository();

// Use Cases
const createApartmentUseCase = new CreateApartmentUseCase(apartmentRepository);
const getApartmentUseCase = new GetApartmentUseCase(apartmentRepository);
const listApartmentsUseCase = new ListApartmentsUseCase(apartmentRepository);
const updateApartmentUseCase = new UpdateApartmentUseCase(apartmentRepository);

// Controller
export const apartmentController = new ApartmentController(
  createApartmentUseCase,
  getApartmentUseCase,
  listApartmentsUseCase,
  updateApartmentUseCase,
);