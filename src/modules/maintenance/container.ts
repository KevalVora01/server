import { InvoiceRepository } from "./infrastructure/repositories/InvoiceRepository";
import { MaintenanceSettingRepository } from "./infrastructure/repositories/MaintenanceSettingRepository";
import { ResidentRepository } from "../residents/infrastructure/repositories/ResidentRepository";
import { ApartmentRepository } from "../apartments/infrastructure/repositories/ApartmentRepository";

import { StripeService } from "./infrastructure/services/StripeService";
import { InvoicePdfService } from "./infrastructure/services/InvoicePdfService";
import { MaintenanceNotifier } from "./infrastructure/services/MaintenanceNotifier";

import { GetMaintenanceAmountUseCase } from "./application/use-cases/GetMaintenanceAmountUseCase";
import { UpdateMaintenanceAmountUseCase } from "./application/use-cases/UpdateMaintenanceAmountUseCase";
import { GenerateInvoicesUseCase } from "./application/use-cases/GenerateInvoicesUseCase";
import { ListInvoicesUseCase } from "./application/use-cases/ListInvoicesUseCase";
import { ListMyInvoicesUseCase } from "./application/use-cases/ListMyInvoicesUseCase";
import { ListApartmentInvoicesUseCase } from "./application/use-cases/ListApartmentInvoicesUseCase";
import { GetInvoiceUseCase } from "./application/use-cases/GetInvoiceUseCase";
import { MarkInvoiceSettledUseCase } from "./application/use-cases/MarkInvoiceSettledUseCase";
import { CreatePaymentIntentUseCase } from "./application/use-cases/CreatePaymentIntentUseCase";
import { ConfirmPaymentUseCase } from "./application/use-cases/ConfirmPaymentUseCase";
import { GenerateInvoicePdfUseCase } from "./application/use-cases/GenerateInvoicePdfUseCase";
import { HandleStripePaymentSucceededUseCase } from "./application/use-cases/HandleStripePaymentSucceededUseCase";
import { GetDashboardMetricsUseCase } from "./application/use-cases/GetDashboardMetricsUseCase";
import { SendMaintenanceRemindersJob } from "./application/jobs/SendMaintenanceRemindersJob";

import { MaintenanceController } from "./presentation/controllers/MaintenanceController";
import { WebhookController } from "./presentation/controllers/WebhookController";

// Repositories
const invoiceRepository = new InvoiceRepository();
const maintenanceSettingRepository = new MaintenanceSettingRepository();
const residentRepository = new ResidentRepository();
const apartmentRepository = new ApartmentRepository();

// Services
const stripeService = new StripeService();
const invoicePdfService = new InvoicePdfService();
const maintenanceNotifier = new MaintenanceNotifier(residentRepository);

// Use Cases
const getMaintenanceAmountUseCase = new GetMaintenanceAmountUseCase(maintenanceSettingRepository);
const updateMaintenanceAmountUseCase = new UpdateMaintenanceAmountUseCase(maintenanceSettingRepository);
const generateInvoicesUseCase = new GenerateInvoicesUseCase(
  invoiceRepository,
  maintenanceSettingRepository,
  apartmentRepository,
);
const listInvoicesUseCase = new ListInvoicesUseCase(invoiceRepository);
const listMyInvoicesUseCase = new ListMyInvoicesUseCase(invoiceRepository, residentRepository);
const listApartmentInvoicesUseCase = new ListApartmentInvoicesUseCase(invoiceRepository, residentRepository);
const getInvoiceUseCase = new GetInvoiceUseCase(invoiceRepository, residentRepository);
const createPaymentIntentUseCase = new CreatePaymentIntentUseCase(invoiceRepository, stripeService, residentRepository);
const generateInvoicePdfUseCase = new GenerateInvoicePdfUseCase(
  invoiceRepository,
  invoicePdfService,
  residentRepository,
);
const markInvoiceSettledUseCase = new MarkInvoiceSettledUseCase(
  invoiceRepository,
  generateInvoicePdfUseCase,
  maintenanceNotifier,
);
const handleStripePaymentSucceededUseCase = new HandleStripePaymentSucceededUseCase(
  invoiceRepository,
  maintenanceNotifier,
  generateInvoicePdfUseCase,
);

const confirmPaymentUseCase = new ConfirmPaymentUseCase(
  invoiceRepository,
  stripeService,
  maintenanceNotifier,
  generateInvoicePdfUseCase,
);
const getDashboardMetricsUseCase = new GetDashboardMetricsUseCase(invoiceRepository);

// Scheduled Job (exported so shared/jobs/scheduler.ts can register it)
export const sendMaintenanceRemindersJob = new SendMaintenanceRemindersJob(
  invoiceRepository,
  maintenanceNotifier,
);

// Controllers
export const maintenanceController = new MaintenanceController(
  getMaintenanceAmountUseCase,
  updateMaintenanceAmountUseCase,
  generateInvoicesUseCase,
  listInvoicesUseCase,
  listMyInvoicesUseCase,
  listApartmentInvoicesUseCase,
  getInvoiceUseCase,
  markInvoiceSettledUseCase,
  createPaymentIntentUseCase,
  confirmPaymentUseCase,
  generateInvoicePdfUseCase,
  getDashboardMetricsUseCase,
  residentRepository,
);

export const webhookController = new WebhookController(
  stripeService,
  handleStripePaymentSucceededUseCase,
);