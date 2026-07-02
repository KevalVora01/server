import { Router } from "express";
import { familyMemberController } from "../../container";
import { createJwtMiddleware } from "../../../../shared/middleware/jwtMiddleware";
import { JwtTokenService } from "../../../auth/infrastructure/services/JwtTokenService";
import { rbacMiddleware } from "../../../../shared/middleware/rbacMiddleware";
import { UserRole } from "../../../auth/domain/entities/User";
import { validateCreateFamilyMember, validateUpdateFamilyMember } from "../validators/familyMemberValidators";

const router = Router({ mergeParams: true });
const jwtMiddleware = createJwtMiddleware(new JwtTokenService());

/*
|--------------------------------------------------------------------------
| Admin + Resident — GET only
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  jwtMiddleware,
  rbacMiddleware(UserRole.ADMIN, UserRole.RESIDENT),
  familyMemberController.getFamilyMembers
);

/*
|--------------------------------------------------------------------------
| Resident Only — CUD
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  jwtMiddleware,
  rbacMiddleware(UserRole.RESIDENT),
  validateCreateFamilyMember,
  familyMemberController.createFamilyMember
);

router.put(
  "/:id",
  jwtMiddleware,
  rbacMiddleware(UserRole.RESIDENT),
  validateUpdateFamilyMember,
  familyMemberController.updateFamilyMember
);

router.delete(
  "/:id",
  jwtMiddleware,
  rbacMiddleware(UserRole.RESIDENT),
  familyMemberController.deleteFamilyMember
);

export default router;