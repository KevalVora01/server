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
| Static Segment Routes (Declared before any dynamic /:id route)
|--------------------------------------------------------------------------
*/

// Resident: pre-register an expected visitor
router.post(
  "/pre-register",
  jwtMiddleware,
  rbacMiddleware(UserRole.RESIDENT),
  validatePreRegisterVisitor,
  visitorController.preRegister
);

// Security: log an unregistered walk-in visitor (+ photo)
router.post(
  "/walk-in",
  jwtMiddleware,
  rbacMiddleware(UserRole.SECURITY),
  uploadMiddleware.single("photo"),
  validateLogWalkInVisitor,
  visitorController.logWalkIn
);

// Resident: own apartment's visitor history
router.get(
  "/my",
  jwtMiddleware,
  rbacMiddleware(UserRole.RESIDENT, UserRole.ADMIN, UserRole.SECURITY),
  visitorController.listMyVisitors
);

// Security / Admin: everyone currently inside
router.get(
  "/current",
  jwtMiddleware,
  rbacMiddleware(UserRole.SECURITY, UserRole.ADMIN),
  visitorController.listCurrentlyInside
);

router.get(
  "/search",
  jwtMiddleware,
  rbacMiddleware(UserRole.SECURITY, UserRole.ADMIN),
  visitorController.searchPreRegistered
);

// Admin / Security: metrics (today, inside, avg duration)
router.get(
  "/dashboard",
  jwtMiddleware,
  rbacMiddleware(UserRole.ADMIN, UserRole.SECURITY),
  visitorController.getDashboardMetrics
);

// Admin / Security / Resident: full visitor log, filterable
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

// Resident / Security: get visitor by ID
router.get(
  "/:id",
  jwtMiddleware,
  rbacMiddleware(UserRole.RESIDENT, UserRole.SECURITY, UserRole.ADMIN),
  visitorController.findById
);

// Resident / Security: approve or reject a Pending visitor
router.post(
  "/:id/respond",
  jwtMiddleware,
  rbacMiddleware(UserRole.RESIDENT, UserRole.SECURITY),
  validateRespondToApproval,
  visitorController.respond
);

// Security: mark visitor as entered (+ optional photo)
router.patch(
  "/:id/check-in",
  jwtMiddleware,
  rbacMiddleware(UserRole.SECURITY),
  uploadMiddleware.single("photo"),
  visitorController.checkIn
);

// Security: mark visitor as exited
router.patch(
  "/:id/check-out",
  jwtMiddleware,
  rbacMiddleware(UserRole.SECURITY),
  visitorController.checkOut
);

// Resident: cancel a pre-registered visitor
router.delete(
  "/:id",
  jwtMiddleware,
  rbacMiddleware(UserRole.RESIDENT),
  visitorController.cancel
);

export default router;