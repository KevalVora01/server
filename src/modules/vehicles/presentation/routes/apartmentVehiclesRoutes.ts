import { Router } from "express";
import { vehicleController } from "../../container";
import { createJwtMiddleware } from "../../../../shared/middleware/jwtMiddleware";
import { JwtTokenService } from "../../../auth/infrastructure/services/JwtTokenService";
import { rbacMiddleware } from "../../../../shared/middleware/rbacMiddleware";
import { UserRole } from "../../../auth/domain/entities/User";

const router = Router();
const jwtMiddleware = createJwtMiddleware(new JwtTokenService());

router.get(
  "/apartment",
  jwtMiddleware,
  rbacMiddleware(UserRole.RESIDENT),
  vehicleController.listApartmentVehicles
);

export default router;