import { SequelizeUserRepository } from "./infrastructure/repositories/SequelizeUserRepository";
import { SequelizeRefreshTokenRepository } from "./infrastructure/repositories/SequelizeRefreshTokenRepository";
import { BcryptPasswordHasher } from "./infrastructure/services/BcryptPasswordHasher";
import { JwtTokenService } from "./infrastructure/services/JwtTokenService";
import { CreateUserUseCase } from "./application/use-cases/CreateUserUseCase";
import { LoginUseCase } from "./application/use-cases/LoginUseCase";
import { RefreshTokenUseCase } from "./application/use-cases/RefreshTokenUseCase";
import { LogoutUseCase } from "./application/use-cases/LogoutUseCase";
import { GetCurrentUserUseCase } from "./application/use-cases/GetCurrentUserUseCase";
import { AuthController } from "./presentation/controllers/authController";

// 1. Core Infrastructure Adapters
const userRepository = new SequelizeUserRepository();
const refreshTokenRepository = new SequelizeRefreshTokenRepository();
const passwordHasher = new BcryptPasswordHasher();
const tokenService = new JwtTokenService();

// 2. Intermediary Business Use Case Layer
const createUserUseCase = new CreateUserUseCase(userRepository, passwordHasher);
const loginUseCase = new LoginUseCase(userRepository, refreshTokenRepository, passwordHasher, tokenService);
const refreshTokenUseCase = new RefreshTokenUseCase(userRepository, refreshTokenRepository, tokenService);
const logoutUseCase = new LogoutUseCase(refreshTokenRepository);
const getCurrentUserUseCase = new GetCurrentUserUseCase(userRepository);

// 3. Presentation Layer Controller Delivery Singleton
export const authController = new AuthController(
  createUserUseCase,
  loginUseCase,
  refreshTokenUseCase,
  logoutUseCase,
  getCurrentUserUseCase
);