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

import multer from "multer";

const router = Router();
const jwtMiddleware = createJwtMiddleware(new JwtTokenService());
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

/*
|--------------------------------------------------------------------------
| Admin Only
|--------------------------------------------------------------------------
*/

router.post(
  "/import",
  jwtMiddleware,
  rbacMiddleware(UserRole.ADMIN),
  upload.single("file"),
  apartmentController.importApartments
);

router.get(
  "/",
  jwtMiddleware,
  rbacMiddleware(UserRole.ADMIN, UserRole.SECURITY, UserRole.RESIDENT),
  validateListApartments,
  apartmentController.listApartments
);

router.get(
  "/:id",
  jwtMiddleware,
  rbacMiddleware(UserRole.ADMIN, UserRole.SECURITY, UserRole.RESIDENT),
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