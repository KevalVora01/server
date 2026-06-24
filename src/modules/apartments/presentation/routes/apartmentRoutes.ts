import { Router } from "express";
import { apartmentController } from "../../container";
import { createJwtMiddleware } from "../../../../shared/middleware/jwtMiddleware";
import { JwtTokenService } from "../../../auth/infrastructure/services/JwtTokenService";
import { rbacMiddleware } from "../../../../shared/middleware/rbacMiddleware";
import { UserRole } from "../../../auth/domain/entities/User";
import {
  validateCreateApartment,
  validateUpdateApartment,
  validateListApartments,
} from "../validators/apartmentValidators";

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
  validateCreateApartment,
  apartmentController.createApartment
);

router.get(
  "/",
  jwtMiddleware,
  rbacMiddleware(UserRole.ADMIN),
  validateListApartments,
  apartmentController.listApartments
);

router.get(
  "/:id",
  jwtMiddleware,
  rbacMiddleware(UserRole.ADMIN),
  apartmentController.getApartment
);

router.put(
  "/:id",
  jwtMiddleware,
  rbacMiddleware(UserRole.ADMIN),
  validateUpdateApartment,
  apartmentController.updateApartment
);

export default router;