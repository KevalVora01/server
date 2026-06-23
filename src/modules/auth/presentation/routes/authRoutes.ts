import { Router } from "express";

import { authController } from "../../container";

import { createJwtMiddleware } from "../../../../shared/middleware/jwtMiddleware";
import { JwtTokenService } from "../../infrastructure/services/JwtTokenService";

import { rbacMiddleware } from "../../../../shared/middleware/rbacMiddleware";
import { UserRole } from "../../domain/entities/User";
import { validateForgotPassword, validateLogin, validateRegister, validateResetPassword } from '../validators/authValidators';

const router = Router();

const jwtMiddleware = createJwtMiddleware(new JwtTokenService());

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

router.post(
  "/login",
  validateLogin,
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
| Password Reset Routes (Public)
|--------------------------------------------------------------------------
*/

router.post(
  "/forgot-password",
  validateForgotPassword,
  authController.forgotPassword
);

router.post(
  "/reset-password",
  validateResetPassword,
  authController.resetPassword
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
  validateRegister,
  authController.createUser
);

export default router;