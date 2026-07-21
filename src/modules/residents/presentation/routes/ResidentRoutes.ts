import { Router } from "express";

import { residentController } from "../../container";

import { createJwtMiddleware } from "../../../../shared/middleware/jwtMiddleware";
import { JwtTokenService } from "../../../auth/infrastructure/services/JwtTokenService";

import { rbacMiddleware } from "../../../../shared/middleware/rbacMiddleware";
import { UserRole } from "../../../auth/domain/entities/User";

import {
  validateCreateResident,
  validateUpdateResident,
  validateListResidents,
} from "../validators/residentValidators";
import familyMemberRoutes from "../../../family-members/presentation/routes/familyMemberRoutes";

import multer from "multer";

const router = Router();
const jwtMiddleware = createJwtMiddleware(new JwtTokenService());
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

/*
|--------------------------------------------------------------------------
| Admin Only
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  jwtMiddleware,
  rbacMiddleware(UserRole.ADMIN),
  validateCreateResident,
  residentController.createResident
);

router.post(
  "/import",
  jwtMiddleware,
  rbacMiddleware(UserRole.ADMIN),
  upload.single("file"),
  residentController.importResidents
);

router.get(
  "/",
  jwtMiddleware,
  rbacMiddleware(UserRole.ADMIN),
  validateListResidents,
  residentController.listResidents
);

router.get(
  "/my/tenants",
  jwtMiddleware,
  rbacMiddleware(UserRole.RESIDENT),
  residentController.listApartmentTenants
);

router.get(
  "/me",
  jwtMiddleware,
  rbacMiddleware(UserRole.RESIDENT),
  residentController.getMyResident
);

router.post(
  "/promote-occupants",
  jwtMiddleware,
  rbacMiddleware(UserRole.ADMIN),
  residentController.promoteOccupants
);

router.get(
  "/:id",
  jwtMiddleware,
  rbacMiddleware(UserRole.ADMIN),
  residentController.getResident
);

router.put(
  "/:id",
  jwtMiddleware,
  rbacMiddleware(UserRole.ADMIN),
  validateUpdateResident,
  residentController.updateResident
);

router.delete(
  "/:id",
  jwtMiddleware,
  rbacMiddleware(UserRole.ADMIN),
  residentController.deactivateResident
);


/*
|--------------------------------------------------------------------------
| Nested — Family Members
|--------------------------------------------------------------------------
*/

router.use(
  "/:residentId/family-members", 
  familyMemberRoutes
);

export default router;