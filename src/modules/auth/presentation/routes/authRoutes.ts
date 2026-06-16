import { Router } from "express";

import { authController } from "../../container";

import { jwtMiddleware } from "../../../../shared/middleware/jwtMiddleware";

import { rbacMiddleware } from "../../../../shared/middleware/rbacMiddleware";
import { UserRole } from "../../domain/entities/User";

const router = Router();

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

router.post(
  "/login",
  authController.login
);

router.post(
  "/refresh",
  authController.refreshToken
);

router.post(
  "/logout",
  authController.logout
);

/*
|--------------------------------------------------------------------------
| Protected Routes
|--------------------------------------------------------------------------
*/

router.get(
  "/me",
  jwtMiddleware,
  authController.me
);

/*
|--------------------------------------------------------------------------
| Admin Only
|--------------------------------------------------------------------------
*/

router.post(
  "/users",
  jwtMiddleware,
  rbacMiddleware(UserRole.ADMIN),
  authController.createUser
);

export default router;