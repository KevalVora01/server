import { CloudinaryService } from "../../shared/services/CloudinaryService";
import { DocumentRequestRepository } from "./infrastructure/repositories/DocumentRequestRepository";
import { SequelizeDocumentRequestVoteRepository } from "./infrastructure/repositories/SequelizeDocumentRequestVoteRepository";
import { ResidentRepository } from "../residents/infrastructure/repositories/ResidentRepository";
import { DocumentRequestNotifier } from "./infrastructure/services/DocumentRequestNotifier";
import { CreateDocumentRequestUseCase } from "./application/use-cases/CreateDocumentRequestUseCase";
import { GetMyRequestsUseCase } from "./application/use-cases/GetMyRequestsUseCase";
import { GetReceivedRequestsUseCase } from "./application/use-cases/GetReceivedRequestsUseCase";
import { UploadDocumentUseCase } from "./application/use-cases/UploadDocumentUseCase";
import { RejectRequestUseCase } from "./application/use-cases/RejectRequestUseCase";
import { CancelRequestUseCase } from "./application/use-cases/CancelRequestUseCase";
import { BulkRecordDocumentVotesUseCase } from "./application/use-cases/BulkRecordDocumentVotesUseCase";
import { FinalizeDocumentRequestUseCase } from "./application/use-cases/FinalizeDocumentRequestUseCase";
import { GetDocumentRequestDetailUseCase } from "./application/use-cases/GetDocumentRequestDetailUseCase";
import { DocumentRequestController } from "./presentation/controllers/DocumentRequestController";

const documentRequestRepository = new DocumentRequestRepository();
const documentRequestVoteRepository = new SequelizeDocumentRequestVoteRepository();
const residentRepository = new ResidentRepository();
const cloudinaryService = new CloudinaryService();
const documentRequestNotifier = new DocumentRequestNotifier();

const createDocumentRequestUseCase = new CreateDocumentRequestUseCase(
  documentRequestRepository,
  residentRepository,
  documentRequestNotifier,
);
const getMyRequestsUseCase = new GetMyRequestsUseCase(documentRequestRepository);
const getReceivedRequestsUseCase = new GetReceivedRequestsUseCase(documentRequestRepository);
const uploadDocumentUseCase = new UploadDocumentUseCase(documentRequestRepository, cloudinaryService, documentRequestNotifier);
const rejectRequestUseCase = new RejectRequestUseCase(documentRequestRepository, documentRequestNotifier);
const cancelRequestUseCase = new CancelRequestUseCase(documentRequestRepository, documentRequestNotifier);
const bulkRecordDocumentVotesUseCase = new BulkRecordDocumentVotesUseCase(
  documentRequestRepository,
  documentRequestVoteRepository,
);
const finalizeDocumentRequestUseCase = new FinalizeDocumentRequestUseCase(
  documentRequestRepository,
  documentRequestVoteRepository,
  documentRequestNotifier,
);
const getDocumentRequestDetailUseCase = new GetDocumentRequestDetailUseCase(documentRequestRepository);

export const documentRequestController = new DocumentRequestController(
  createDocumentRequestUseCase,
  getMyRequestsUseCase,
  getReceivedRequestsUseCase,
  uploadDocumentUseCase,
  rejectRequestUseCase,
  cancelRequestUseCase,
  bulkRecordDocumentVotesUseCase,
  finalizeDocumentRequestUseCase,
  getDocumentRequestDetailUseCase,
  residentRepository,
);
