import { Router } from "express";
import { visitorController } from "../../container";
import { createJwtMiddleware } from "../../../../shared/middleware/jwtMiddleware";
import { JwtTokenService } from "../../../auth/infrastructure/services/JwtTokenService";
import { rbacMiddleware } from "../../../../shared/middleware/rbacMiddleware";
import { UserRole } from "../../../auth/domain/entities/User";
import { uploadMiddleware } from "../../../../shared/middleware/uploadMiddleware";
import {
  validatePreRegisterVisitor,
  validateLogWalkInVisitor,
  validateRespondToApproval,
} from "../validators/visitorValidators";

const router = Router();
const jwtMiddleware = createJwtMiddleware(new JwtTokenService());

/*
|--------------------------------------------------------------------------
| Static Segment Routes (declared before any dynamic /:id route)
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| Resident Only — pre-register + cancel + own visitors
|--------------------------------------------------------------------------
*/

// Pre-register an expected visitor (+ optional photo)
router.post(
  "/pre-register",
  jwtMiddleware,
  rbacMiddleware(UserRole.RESIDENT),
  uploadMiddleware.single("photo"),
  validatePreRegisterVisitor,
  visitorController.preRegister
);

// Cancel a pre-registered visitor
router.delete(
  "/:id",
  jwtMiddleware,
  rbacMiddleware(UserRole.RESIDENT),
  visitorController.cancel
);

/*
|--------------------------------------------------------------------------
| Security Only — walk-in + check-in + check-out
|--------------------------------------------------------------------------
*/

// Log an unregistered walk-in visitor (+ photo)
router.post(
  "/walk-in",
  jwtMiddleware,
  rbacMiddleware(UserRole.SECURITY),
  uploadMiddleware.single("photo"),
  validateLogWalkInVisitor,
  visitorController.logWalkIn
);

// Mark visitor as entered (+ optional photo)
router.patch(
  "/:id/check-in",
  jwtMiddleware,
  rbacMiddleware(UserRole.SECURITY),
  uploadMiddleware.single("photo"),
  visitorController.checkIn
);

// Mark visitor as exited
router.patch(
  "/:id/check-out",
  jwtMiddleware,
  rbacMiddleware(UserRole.SECURITY),
  visitorController.checkOut
);

/*
|--------------------------------------------------------------------------
| Resident + Security — approve/reject pending visitors
|--------------------------------------------------------------------------
*/

// Approve or reject a Pending visitor
router.post(
  "/:id/respond",
  jwtMiddleware,
  rbacMiddleware(UserRole.RESIDENT, UserRole.SECURITY),
  validateRespondToApproval,
  visitorController.respond
);

/*
|--------------------------------------------------------------------------
| Resident + Admin + Security — read-only queries
|--------------------------------------------------------------------------
*/

// Own apartment's visitor history
router.get(
  "/my",
  jwtMiddleware,
  rbacMiddleware(UserRole.RESIDENT, UserRole.ADMIN, UserRole.SECURITY),
  visitorController.listMyVisitors
);

// Everyone currently inside
router.get(
  "/current",
  jwtMiddleware,
  rbacMiddleware(UserRole.SECURITY, UserRole.ADMIN),
  visitorController.listCurrentlyInside
);

// Search pre-registered visitors
router.get(
  "/search",
  jwtMiddleware,
  rbacMiddleware(UserRole.SECURITY, UserRole.ADMIN),
  visitorController.searchPreRegistered
);

// Visitor dashboard metrics (today, inside, avg duration)
router.get(
  "/dashboard",
  jwtMiddleware,
  rbacMiddleware(UserRole.ADMIN, UserRole.SECURITY),
  visitorController.getDashboardMetrics
);

// Full visitor log, filterable
router.get(
  "/",
  jwtMiddleware,
  rbacMiddleware(UserRole.ADMIN, UserRole.SECURITY, UserRole.RESIDENT),
  visitorController.listAll
);

/*
|--------------------------------------------------------------------------
| Dynamic /:id Segment Routes
|--------------------------------------------------------------------------
*/

// Get visitor by ID
router.get(
  "/:id",
  jwtMiddleware,
  rbacMiddleware(UserRole.RESIDENT, UserRole.SECURITY, UserRole.ADMIN),
  visitorController.findById
);

export default router;