import { Router } from "express";
import { complaintController } from "../../container";
import { createJwtMiddleware } from "../../../../shared/middleware/jwtMiddleware";
import { JwtTokenService } from "../../../auth/infrastructure/services/JwtTokenService";
import { rbacMiddleware } from "../../../../shared/middleware/rbacMiddleware";
import { UserRole } from "../../../auth/domain/entities/User";
import {
  validateCreateComplaint,
  validateUpdateComplaintStatus,
  validateCreateComment,
} from "../validators/complaintValidators";
import { uploadMiddleware } from "../../../../shared/middleware/uploadMiddleware";

const router = Router();
const jwtMiddleware = createJwtMiddleware(new JwtTokenService());

/*
|--------------------------------------------------------------------------
| Resident Only — Create + own list
|--------------------------------------------------------------------------
*/
router.post(
  "/",
  jwtMiddleware,
  rbacMiddleware(UserRole.RESIDENT),
  uploadMiddleware.array("images", 5),
  validateCreateComplaint,
  complaintController.createComplaint
);  

router.get(
  "/my",
  jwtMiddleware,
  rbacMiddleware(UserRole.RESIDENT),
  complaintController.listMyComplaints
);

/*
|--------------------------------------------------------------------------
| Admin Only — full list + status update
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  jwtMiddleware,
  rbacMiddleware(UserRole.ADMIN),
  complaintController.listComplaints
);

router.patch(
  "/:id/status",
  jwtMiddleware,
  rbacMiddleware(UserRole.ADMIN),
  validateUpdateComplaintStatus,
  complaintController.updateStatus
);

/*
|--------------------------------------------------------------------------
| Resident Only — apartment-wide complaints (Owner only, enforced in use-case)
|--------------------------------------------------------------------------
*/

router.get(
  "/apartment",
  jwtMiddleware,
  rbacMiddleware(UserRole.RESIDENT),
  complaintController.listApartmentComplaints
);

/*
|--------------------------------------------------------------------------
| Admin + Resident — detail & comments (ownership enforced in use-case)
|--------------------------------------------------------------------------
*/

router.get(
  "/:id",
  jwtMiddleware,
  rbacMiddleware(UserRole.ADMIN, UserRole.RESIDENT),
  complaintController.getComplaint  
);

router.post(
  "/:id/comments",
  jwtMiddleware,
  rbacMiddleware(UserRole.ADMIN, UserRole.RESIDENT),
  validateCreateComment,
  complaintController.addComment
);

router.get(
  "/:id/comments",
  jwtMiddleware,
  rbacMiddleware(UserRole.ADMIN, UserRole.RESIDENT),
  complaintController.listComments
);

router.delete(
  "/:id",
  jwtMiddleware,
  rbacMiddleware(UserRole.ADMIN, UserRole.RESIDENT),
  complaintController.deleteComplaint
);

export default router;