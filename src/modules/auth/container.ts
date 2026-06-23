import { UserRepository } from "./infrastructure/repositories/UserRepository";
import { RefreshTokenRepository } from "./infrastructure/repositories/RefreshTokenRepository";
import { PasswordResetTokenRepository } from "./infrastructure/repositories/PasswordResetTokenRepository";
import { BcryptPasswordHasher } from "./infrastructure/services/BcryptPasswordHasher";
import { JwtTokenService } from "./infrastructure/services/JwtTokenService";
import { ResendEmailService } from "./infrastructure/services/ResendEmailService";
import { CreateUserUseCase } from "./application/use-cases/CreateUserUseCase";
import { LoginUseCase } from "./application/use-cases/LoginUseCase";
import { RefreshTokenUseCase } from "./application/use-cases/RefreshTokenUseCase";
import { LogoutUseCase } from "./application/use-cases/LogoutUseCase";
import { GetCurrentUserUseCase } from "./application/use-cases/GetCurrentUserUseCase";
import { ForgotPasswordUseCase } from "./application/use-cases/ForgotPasswordUseCase";
import { ResetPasswordUseCase } from "./application/use-cases/ResetPasswordUseCase";
import { AuthController } from "./presentation/controllers/authController";

// 1. Core Infrastructure Adapters
const userRepository = new UserRepository();
const refreshTokenRepository = new RefreshTokenRepository();
const passwordResetTokenRepository = new PasswordResetTokenRepository();
const passwordHasher = new BcryptPasswordHasher();
const tokenService = new JwtTokenService();
const emailService = new ResendEmailService();

// 2. Intermediary Business Use Case Layer
const createUserUseCase = new CreateUserUseCase(userRepository, passwordHasher);
const loginUseCase = new LoginUseCase(userRepository, refreshTokenRepository, passwordHasher, tokenService);
const refreshTokenUseCase = new RefreshTokenUseCase(userRepository, refreshTokenRepository, tokenService);
const logoutUseCase = new LogoutUseCase(refreshTokenRepository);
const getCurrentUserUseCase = new GetCurrentUserUseCase(userRepository);
const forgotPasswordUseCase = new ForgotPasswordUseCase(userRepository, passwordResetTokenRepository, emailService);
const resetPasswordUseCase = new ResetPasswordUseCase(userRepository, passwordResetTokenRepository, passwordHasher);

// 3. Presentation Layer Controller Delivery Singleton
export const authController = new AuthController(
  createUserUseCase,
  loginUseCase,
  refreshTokenUseCase,
  logoutUseCase,
  getCurrentUserUseCase,
  forgotPasswordUseCase,
  resetPasswordUseCase,
);