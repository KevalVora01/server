import { Router } from "express";
import { amenityController } from "../../container";
import { createJwtMiddleware } from "../../../../shared/middleware/jwtMiddleware";
import { JwtTokenService } from "../../../auth/infrastructure/services/JwtTokenService";
import { rbacMiddleware } from "../../../../shared/middleware/rbacMiddleware";
import { UserRole } from "../../../auth/domain/entities/User";
import {
  validateCreateAmenity,
  validateUpdateAmenity,
  validateCreateBlackout,
  validateGetAvailability,
} from "../validators/amenityValidators";

const router = Router();
const jwtMiddleware = createJwtMiddleware(new JwtTokenService());

/*
|--------------------------------------------------------------------------
| Admin Only — amenity management
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  jwtMiddleware,
  rbacMiddleware(UserRole.ADMIN),
  validateCreateAmenity,
  amenityController.createAmenity
);

router.put(
  "/:id",
  jwtMiddleware,
  rbacMiddleware(UserRole.ADMIN),
  validateUpdateAmenity,
  amenityController.updateAmenity
);

router.delete(
  "/:id",
  jwtMiddleware,
  rbacMiddleware(UserRole.ADMIN),
  amenityController.deactivateAmenity
);

/*
|--------------------------------------------------------------------------
| Admin + Resident — browse & detail
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  jwtMiddleware,
  rbacMiddleware(UserRole.ADMIN, UserRole.RESIDENT),
  amenityController.listAmenities
);

router.get(
  "/:id",
  jwtMiddleware,
  rbacMiddleware(UserRole.ADMIN, UserRole.RESIDENT),
  amenityController.getAmenity
);

router.get(
  "/:id/availability",
  jwtMiddleware,
  rbacMiddleware(UserRole.ADMIN, UserRole.RESIDENT),
  validateGetAvailability,
  amenityController.getAvailability
);

/*
|--------------------------------------------------------------------------
| Admin Only — blackouts
|--------------------------------------------------------------------------
*/

router.post(
  "/:id/blackouts",
  jwtMiddleware,
  rbacMiddleware(UserRole.ADMIN),
  validateCreateBlackout,
  amenityController.createBlackout
);

router.get(
  "/:id/blackouts",
  jwtMiddleware,
  rbacMiddleware(UserRole.ADMIN),
  amenityController.listBlackouts
);

router.delete(
  "/:id/blackouts/:bid",
  jwtMiddleware,
  rbacMiddleware(UserRole.ADMIN),
  amenityController.deleteBlackout
);

export default router;
