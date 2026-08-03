import { VisitorRepository } from "./infrastructure/repositories/VisitorRepository";
import { ResidentRepository } from "../residents/infrastructure/repositories/ResidentRepository";
import { CloudinaryService } from "../../shared/services/CloudinaryService";
import { VisitorNotifier } from "./infrastructure/services/VisitorNotifier";

import { PreRegisterVisitorUseCase } from "./application/use-cases/PreRegisterVisitorUseCase";
import { LogWalkInVisitorUseCase } from "./application/use-cases/LogWalkInVisitorUseCase";
import { RespondToApprovalUseCase } from "./application/use-cases/RespondToApprovalUseCase";
import { CheckInVisitorUseCase } from "./application/use-cases/CheckInVisitorUseCase";
import { CheckOutVisitorUseCase } from "./application/use-cases/CheckOutVisitorUseCase";
import { CancelPreRegisteredVisitorUseCase } from "./application/use-cases/CancelPreRegisteredVisitorUseCase";
import { ListVisitorsUseCase } from "./application/use-cases/ListVisitorsUseCase";
import { ListMyVisitorsUseCase } from "./application/use-cases/ListMyVisitorsUseCase";
import { ListCurrentlyInsideUseCase } from "./application/use-cases/ListCurrentlyInsideUseCase";
import { GetDashboardMetricsUseCase } from "./application/use-cases/GetDashboardMetricsUseCase";
import { AutoRejectExpiredApprovalsJob } from "./application/jobs/AutoRejectExpiredApprovalsJob";
import { DeleteExpiredVisitorPhotosJob } from "./application/jobs/DeleteExpiredVisitorPhotosJob";

import { VisitorController } from "./presentation/controllers/VisitorController";
import { SearchPreRegisteredVisitorsUseCase } from "./application/use-cases/SearchPreRegisteredVisitorsUseCase";

// Repositories
const visitorRepository = new VisitorRepository();
const residentRepository = new ResidentRepository();

// Services
const cloudinaryService = new CloudinaryService();
const visitorNotifier = new VisitorNotifier(residentRepository);

// Use Cases
const preRegisterVisitorUseCase = new PreRegisterVisitorUseCase(visitorRepository, residentRepository);
const logWalkInVisitorUseCase = new LogWalkInVisitorUseCase(visitorRepository, visitorNotifier, residentRepository);
const respondToApprovalUseCase = new RespondToApprovalUseCase(visitorRepository);
const checkInVisitorUseCase = new CheckInVisitorUseCase(visitorRepository, visitorNotifier);
const checkOutVisitorUseCase = new CheckOutVisitorUseCase(visitorRepository, cloudinaryService);
const cancelPreRegisteredVisitorUseCase = new CancelPreRegisteredVisitorUseCase(visitorRepository);
const listVisitorsUseCase = new ListVisitorsUseCase(visitorRepository);
const listMyVisitorsUseCase = new ListMyVisitorsUseCase(visitorRepository, residentRepository);
const searchPreRegisteredVisitorsUseCase = new SearchPreRegisteredVisitorsUseCase(visitorRepository);
const listCurrentlyInsideUseCase = new ListCurrentlyInsideUseCase(visitorRepository);
const getDashboardMetricsUseCase = new GetDashboardMetricsUseCase(visitorRepository);

// Scheduled Job (exported so shared/jobs/scheduler.ts can register it)
export const autoRejectExpiredApprovalsJob = new AutoRejectExpiredApprovalsJob(visitorRepository, visitorNotifier);
export const deleteExpiredVisitorPhotosJob = new DeleteExpiredVisitorPhotosJob(visitorRepository, cloudinaryService);

// Controller
export const visitorController = new VisitorController(
  preRegisterVisitorUseCase,
  logWalkInVisitorUseCase,
  respondToApprovalUseCase,
  checkInVisitorUseCase,
  checkOutVisitorUseCase,
  cancelPreRegisteredVisitorUseCase,
  listVisitorsUseCase,
  listMyVisitorsUseCase,
  listCurrentlyInsideUseCase,
  getDashboardMetricsUseCase,
  searchPreRegisteredVisitorsUseCase,
  residentRepository,
  visitorRepository,
  cloudinaryService,
);