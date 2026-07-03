import { VehicleRepository } from "./infrastructure/repositories/VehicleRepository";
import { ResidentRepository } from "../residents/infrastructure/repositories/ResidentRepository";
import { CreateVehicleUseCase } from "./application/use-cases/CreateVehicleUseCase";
import { GetVehiclesUseCase } from "./application/use-cases/GetVehiclesUseCase";
import { UpdateVehicleUseCase } from "./application/use-cases/UpdateVehicleUseCase";
import { DeleteVehicleUseCase } from "./application/use-cases/DeleteVehicleUseCase";
import { VehicleController } from "./presentation/controllers/VehicleController";

// Repositories
const vehicleRepository = new VehicleRepository();
const residentRepository = new ResidentRepository();

// Use Cases
const createVehicleUseCase = new CreateVehicleUseCase(vehicleRepository, residentRepository);
const getVehiclesUseCase = new GetVehiclesUseCase(vehicleRepository, residentRepository);
const updateVehicleUseCase = new UpdateVehicleUseCase(vehicleRepository);
const deleteVehicleUseCase = new DeleteVehicleUseCase(vehicleRepository);

// Controller
export const vehicleController = new VehicleController(
  createVehicleUseCase,
  getVehiclesUseCase,
  updateVehicleUseCase,
  deleteVehicleUseCase,
);