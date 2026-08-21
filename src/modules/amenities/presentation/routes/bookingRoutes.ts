import { Router } from "express";
import { bookingController } from "../../container";
import { createJwtMiddleware } from "../../../../shared/middleware/jwtMiddleware";
import { JwtTokenService } from "../../../auth/infrastructure/services/JwtTokenService";
import { rbacMiddleware } from "../../../../shared/middleware/rbacMiddleware";
import { UserRole } from "../../../auth/domain/entities/User";
import {
  validateCreateBooking,
  validateCancelBooking,
  validateRejectBooking,
  validateSettleBooking,
  validateListBookingsQuery,
} from "../validators/bookingValidators";

const router = Router();
const jwtMiddleware = createJwtMiddleware(new JwtTokenService());

/*
|--------------------------------------------------------------------------
| Resident Only — my bookings
|--------------------------------------------------------------------------
*/

router.get(
  "/me",
  jwtMiddleware,
  rbacMiddleware(UserRole.RESIDENT),
  bookingController.listMyBookings
);

/*
|--------------------------------------------------------------------------
| Admin Only — stats & filtered list
|--------------------------------------------------------------------------
*/

router.get(
  "/stats",
  jwtMiddleware,
  rbacMiddleware(UserRole.ADMIN),
  bookingController.getStats
);

router.get(
  "/",
  jwtMiddleware,
  rbacMiddleware(UserRole.ADMIN),
  validateListBookingsQuery,
  bookingController.listBookings
);

/*
|--------------------------------------------------------------------------
| Admin + Resident — create & detail (ownership enforced in use-case)
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  jwtMiddleware,
  rbacMiddleware(UserRole.ADMIN, UserRole.RESIDENT),
  validateCreateBooking,
  bookingController.createBooking
);

router.get(
  "/:id",
  jwtMiddleware,
  rbacMiddleware(UserRole.ADMIN, UserRole.RESIDENT),
  bookingController.getBooking
);

router.patch(
  "/:id/cancel",
  jwtMiddleware,
  rbacMiddleware(UserRole.ADMIN, UserRole.RESIDENT),
  validateCancelBooking,
  bookingController.cancelBooking
);

router.patch(
  "/:id/settle",
  jwtMiddleware,
  rbacMiddleware(UserRole.ADMIN, UserRole.RESIDENT),
  validateSettleBooking,
  bookingController.settleBooking
);

/*
|--------------------------------------------------------------------------
| Admin Only — approve & reject
|--------------------------------------------------------------------------
*/

router.patch(
  "/:id/approve",
  jwtMiddleware,
  rbacMiddleware(UserRole.ADMIN),
  bookingController.approveBooking
);

router.patch(
  "/:id/reject",
  jwtMiddleware,
  rbacMiddleware(UserRole.ADMIN),
  validateRejectBooking,
  bookingController.rejectBooking
);

export default router;
