import { Router } from "express";
import { maintenanceController } from "../../container";
import { createJwtMiddleware } from "../../../../shared/middleware/jwtMiddleware";
import { JwtTokenService } from "../../../auth/infrastructure/services/JwtTokenService";
import { rbacMiddleware } from "../../../../shared/middleware/rbacMiddleware";
import { UserRole } from "../../../auth/domain/entities/User";
import {
  validateGenerateInvoices,
  validateUpdateMaintenanceAmount,
  validateCreatePaymentIntent,
} from "../validators/maintenanceValidators";

const router = Router();
const jwtMiddleware = createJwtMiddleware(new JwtTokenService());

/*
|--------------------------------------------------------------------------
| Admin Only — settings, generation, full list, manual settle
|--------------------------------------------------------------------------
*/

router.get(
  "/settings",
  jwtMiddleware,
  rbacMiddleware(UserRole.ADMIN),
  maintenanceController.getMaintenanceAmount
);

router.put(
  "/settings",
  jwtMiddleware,
  rbacMiddleware(UserRole.ADMIN),
  validateUpdateMaintenanceAmount,
  maintenanceController.updateMaintenanceAmount
);

router.post(
  "/invoices/generate",
  jwtMiddleware,
  rbacMiddleware(UserRole.ADMIN),
  validateGenerateInvoices,
  maintenanceController.generateInvoices
);

router.get(
  "/invoices",
  jwtMiddleware,
  rbacMiddleware(UserRole.ADMIN),
  maintenanceController.listInvoices
);

router.patch(
  "/invoices/:id/settle",
  jwtMiddleware,
  rbacMiddleware(UserRole.ADMIN),
  maintenanceController.markInvoiceSettled
);

router.post(
  "/invoices/:id/regenerate-receipt",
  jwtMiddleware,
  rbacMiddleware(UserRole.ADMIN),
  maintenanceController.regenerateReceipt
);

/*
|--------------------------------------------------------------------------
| Resident Only — own invoices, pay
|--------------------------------------------------------------------------
*/

router.get(
  "/invoices/my",
  jwtMiddleware,
  rbacMiddleware(UserRole.RESIDENT),
  maintenanceController.listMyInvoices
);

router.post(
  "/invoices/create-payment-intent",
  jwtMiddleware,
  rbacMiddleware(UserRole.RESIDENT),
  validateCreatePaymentIntent,
  maintenanceController.createPaymentIntent
);

router.post(
  "/invoices/confirm-payment",
  jwtMiddleware,
  rbacMiddleware(UserRole.RESIDENT),
  maintenanceController.confirmPayment
);

/*
|--------------------------------------------------------------------------
| Admin + Resident — detail view, dashboard (ownership enforced in use-case)
|--------------------------------------------------------------------------
*/

router.get(
  "/dashboard",
  jwtMiddleware,
  rbacMiddleware(UserRole.ADMIN, UserRole.RESIDENT),
  maintenanceController.getDashboardMetrics
);

router.get(
  "/invoices/:id",
  jwtMiddleware,
  rbacMiddleware(UserRole.ADMIN, UserRole.RESIDENT),
  maintenanceController.getInvoice
);

router.get(
  "/invoices/:id/receipt",
  jwtMiddleware,
  rbacMiddleware(UserRole.ADMIN, UserRole.RESIDENT),
  maintenanceController.downloadReceipt
);

export default router;