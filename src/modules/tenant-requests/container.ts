import { TenantRequestRepository } from "./infrastructure/repositories/TenantRequestRepository";
import { TenantRequestVoteRepository } from "./infrastructure/repositories/TenantRequestVoteRepository";
import { UserRepository } from "../auth/infrastructure/repositories/UserRepository";
import { PasswordResetTokenRepository } from "../auth/infrastructure/repositories/PasswordResetTokenRepository";
import { BcryptPasswordHasher } from "../auth/infrastructure/services/BcryptPasswordHasher";
import { NodemailerEmailService } from "../auth/infrastructure/services/NodemailerEmailService";

import { SubmitTenantRequestUseCase } from "./application/use-cases/SubmitTenantRequestUseCase";
import { BulkRecordVotesUseCase } from "./application/use-cases/BulkRecordVotesUseCase";
import { FinalizeTenantRequestUseCase } from "./application/use-cases/FinalizeTenantRequestUseCase";
import { RevokeTenancyUseCase } from "./application/use-cases/RevokeTenancyUseCase";

import { TenantRequestController } from "./presentation/controllers/TenantRequestController";
import { ResidentRepository } from "../residents/infrastructure/repositories/ResidentRepository";

const tenantRequestRepository = new TenantRequestRepository();
const tenantRequestVoteRepository = new TenantRequestVoteRepository();
const residentRepository = new ResidentRepository();
const userRepository = new UserRepository();
const passwordResetTokenRepository = new PasswordResetTokenRepository();
const passwordHasher = new BcryptPasswordHasher();
const emailService = new NodemailerEmailService();

const submitTenantRequestUseCase = new SubmitTenantRequestUseCase(tenantRequestRepository, residentRepository, userRepository);
const bulkRecordVotesUseCase = new BulkRecordVotesUseCase(tenantRequestRepository, tenantRequestVoteRepository, residentRepository, userRepository);
const finalizeTenantRequestUseCase = new FinalizeTenantRequestUseCase(
  tenantRequestRepository,
  tenantRequestVoteRepository,
  residentRepository,
  userRepository,
  passwordResetTokenRepository,
  passwordHasher,
  emailService,
);
const revokeTenancyUseCase = new RevokeTenancyUseCase(residentRepository, userRepository);

export const tenantRequestController = new TenantRequestController(
  submitTenantRequestUseCase,
  bulkRecordVotesUseCase,
  finalizeTenantRequestUseCase,
  revokeTenancyUseCase,
  tenantRequestRepository,
  tenantRequestVoteRepository,
  residentRepository,
);