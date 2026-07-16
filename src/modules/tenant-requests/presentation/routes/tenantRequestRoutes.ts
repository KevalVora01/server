import { Router } from "express";
import { tenantRequestController } from "../../container";
import { createJwtMiddleware } from "../../../../shared/middleware/jwtMiddleware";
import { JwtTokenService } from "../../../auth/infrastructure/services/JwtTokenService";
import { rbacMiddleware } from "../../../../shared/middleware/rbacMiddleware";
import { UserRole } from "../../../auth/domain/entities/User";
import { validateSubmitTenantRequest, validateRecordVote } from "../validators/tenantRequestValidators";

const router = Router();
const jwtMiddleware = createJwtMiddleware(new JwtTokenService());

/*
|--------------------------------------------------------------------------
| Resident (Owner) Only — submit + revoke
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  jwtMiddleware,
  rbacMiddleware(UserRole.RESIDENT),
  validateSubmitTenantRequest,
  tenantRequestController.submitRequest
);

router.post(
  "/revoke-tenancy",
  jwtMiddleware,
  rbacMiddleware(UserRole.RESIDENT),
  tenantRequestController.revokeTenancy
);

/*
|--------------------------------------------------------------------------
| Admin Only — list, vote, finalize
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  jwtMiddleware,
  rbacMiddleware(UserRole.ADMIN),
  tenantRequestController.listRequests
);

router.post(
  "/:id/vote",
  jwtMiddleware,
  rbacMiddleware(UserRole.ADMIN),
  validateRecordVote,
  tenantRequestController.recordVote
);

router.post(
  "/:id/finalize",
  jwtMiddleware,
  rbacMiddleware(UserRole.ADMIN),
  tenantRequestController.finalizeRequest
);

/*
|--------------------------------------------------------------------------
| Admin + Resident — detail view
|--------------------------------------------------------------------------
*/

router.get(
  "/:id",
  jwtMiddleware,
  rbacMiddleware(UserRole.ADMIN, UserRole.RESIDENT),
  tenantRequestController.getRequestDetail
);

export default router;