import { CloudinaryService } from "../../shared/services/CloudinaryService";
import { AddCommentUseCase } from "../complaints/application/use-cases/AddCommentUseCase";
import { CreateComplaintUseCase } from "../complaints/application/use-cases/CreateComplaintUseCase";
import { GetComplaintUseCase } from "../complaints/application/use-cases/GetComplaintUseCase";
import { ListCommentsUseCase } from "../complaints/application/use-cases/ListCommentsUseCase";
import { ListComplaintsUseCase } from "../complaints/application/use-cases/ListComplaintsUseCase";
import { ListMyComplaintsUseCase } from "../complaints/application/use-cases/ListMyComplaintsUseCase";
import { ListApartmentComplaintsUseCase } from "../complaints/application/use-cases/ListApartmentComplaintsUseCase";
import { UpdateComplaintStatusUseCase } from "../complaints/application/use-cases/UpdateComplaintStatusUseCase";
import { DeleteComplaintUseCase } from "../complaints/application/use-cases/DeleteComplaintUseCase";
import { ComplaintCommentRepository } from "../complaints/infrastructure/repositories/ComplaintCommentRepository";
import { ComplaintRepository } from "../complaints/infrastructure/repositories/ComplaintRepository";
import { ComplaintController } from "../complaints/presentation/controllers/ComplaintController";
import { ResidentRepository } from "../residents/infrastructure/repositories/ResidentRepository";
import { ComplaintNotifier } from "./infrastructure/services/ComplaintNotifier";

// Repositories
const complaintRepository = new ComplaintRepository();
const complaintCommentRepository = new ComplaintCommentRepository();
const residentRepository = new ResidentRepository();

// Services
const complaintNotifier = new ComplaintNotifier();

// Use Cases
const createComplaintUseCase = new CreateComplaintUseCase(complaintRepository, complaintNotifier, residentRepository);
const getComplaintUseCase = new GetComplaintUseCase(complaintRepository, residentRepository);
const listComplaintsUseCase = new ListComplaintsUseCase(complaintRepository);
const listMyComplaintsUseCase = new ListMyComplaintsUseCase(complaintRepository);
const listApartmentComplaintsUseCase = new ListApartmentComplaintsUseCase(complaintRepository);
const updateComplaintStatusUseCase = new UpdateComplaintStatusUseCase(complaintRepository, complaintNotifier);
const addCommentUseCase = new AddCommentUseCase(complaintRepository, complaintCommentRepository, complaintNotifier);
const listCommentsUseCase = new ListCommentsUseCase(complaintRepository, complaintCommentRepository);
const deleteComplaintUseCase = new DeleteComplaintUseCase(complaintRepository);
const cloudinaryService = new CloudinaryService();

// Controller
export const complaintController = new ComplaintController(
  createComplaintUseCase,
  getComplaintUseCase,
  listComplaintsUseCase,
  listMyComplaintsUseCase,
  listApartmentComplaintsUseCase,
  updateComplaintStatusUseCase,
  addCommentUseCase,
  listCommentsUseCase,
  residentRepository,
  cloudinaryService,
  deleteComplaintUseCase,
);

