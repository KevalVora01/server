import { Router } from "express";
import { familyMemberController } from "../../container";
import { createJwtMiddleware } from "../../../../shared/middleware/jwtMiddleware";
import { JwtTokenService } from "../../../auth/infrastructure/services/JwtTokenService";
import { rbacMiddleware } from "../../../../shared/middleware/rbacMiddleware";
import { UserRole } from "../../../auth/domain/entities/User";

const router = Router();
const jwtMiddleware = createJwtMiddleware(new JwtTokenService());

/*
|--------------------------------------------------------------------------
| Resident Only — list all family members in own apartment
|--------------------------------------------------------------------------
*/

router.get(
  "/apartment",
  jwtMiddleware,
  rbacMiddleware(UserRole.RESIDENT),
  familyMemberController.listApartmentFamilyMembers
);

export default router;