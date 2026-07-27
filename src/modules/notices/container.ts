import { NoticeRepository } from "./infrastructure/repositories/NoticeRepository";
import { CreateNoticeUseCase } from "./application/use-cases/CreateNoticeUseCase";
import { GetNoticeUseCase } from "./application/use-cases/GetNoticeUseCase";
import { ListNoticesUseCase } from "./application/use-cases/ListNoticesUseCase";
import { UpdateNoticeUseCase } from "./application/use-cases/UpdateNoticeUseCase";
import { DeleteNoticeUseCase } from "./application/use-cases/DeleteNoticeUseCase";
import { TogglePinNoticeUseCase } from "./application/use-cases/TogglePinNoticeUseCase";
import { NoticeController } from "./presentation/controllers/NoticeController";
import { SocketNoticeNotifier } from "./infrastructure/services/SocketNoticeNotifier.ts";
import { ResidentRepository } from "../residents/infrastructure/repositories/ResidentRepository.ts";

// Repositories
const noticeRepository = new NoticeRepository();
const residentRepository = new ResidentRepository();

// Services
const noticeNotifier = new SocketNoticeNotifier(residentRepository);
// Use Cases
const createNoticeUseCase = new CreateNoticeUseCase(noticeRepository, noticeNotifier);
const getNoticeUseCase = new GetNoticeUseCase(noticeRepository);
const listNoticesUseCase = new ListNoticesUseCase(noticeRepository);
const updateNoticeUseCase = new UpdateNoticeUseCase(noticeRepository);
const deleteNoticeUseCase = new DeleteNoticeUseCase(noticeRepository);
const togglePinNoticeUseCase = new TogglePinNoticeUseCase(noticeRepository);


// Controller
export const noticeController = new NoticeController(
  createNoticeUseCase,
  getNoticeUseCase,
  listNoticesUseCase,
  updateNoticeUseCase,
  deleteNoticeUseCase,
  togglePinNoticeUseCase,
);
