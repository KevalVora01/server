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

const router = Router();
const jwtMiddleware = createJwtMiddleware(new JwtTokenService());

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

router.get(
  "/",
  jwtMiddleware,
  rbacMiddleware(UserRole.ADMIN),
  validateListResidents,
  residentController.listResidents
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