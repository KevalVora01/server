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
| Resident Only
|--------------------------------------------------------------------------
*/

router.post(
  "/pre-register",
  jwtMiddleware,
  rbacMiddleware(UserRole.RESIDENT),
  validatePreRegisterVisitor,
  visitorController.preRegister
);

router.get(
  "/my",
  jwtMiddleware,
  rbacMiddleware(UserRole.RESIDENT),
  visitorController.listMyVisitors
);

/*
|--------------------------------------------------------------------------
| Security Only
|--------------------------------------------------------------------------
*/

router.post(
  "/walk-in",
  jwtMiddleware,
  rbacMiddleware(UserRole.SECURITY),
  uploadMiddleware.single("photo"),
  validateLogWalkInVisitor,
  visitorController.logWalkIn
);

router.get(
  "/current",
  jwtMiddleware,
  rbacMiddleware(UserRole.SECURITY, UserRole.ADMIN),
  visitorController.listCurrentlyInside
);

router.patch(
  "/:id/check-in",
  jwtMiddleware,
  rbacMiddleware(UserRole.SECURITY),
  visitorController.checkIn
);

router.patch(
  "/:id/check-out",
  jwtMiddleware,
  rbacMiddleware(UserRole.SECURITY),
  visitorController.checkOut
);

/*
|--------------------------------------------------------------------------
| Admin Only
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  jwtMiddleware,
  rbacMiddleware(UserRole.ADMIN),
  visitorController.listAll
);

router.get(
  "/dashboard",
  jwtMiddleware,
  rbacMiddleware(UserRole.ADMIN),
  visitorController.getDashboardMetrics
);

/*
|--------------------------------------------------------------------------
| Resident + Admin — respond, cancel
|--------------------------------------------------------------------------
*/

router.post(
  "/:id/respond",
  jwtMiddleware,
  rbacMiddleware(UserRole.RESIDENT),
  validateRespondToApproval,
  visitorController.respond
);

router.delete(
  "/:id",
  jwtMiddleware,
  rbacMiddleware(UserRole.RESIDENT),
  visitorController.cancel
);

export default router;