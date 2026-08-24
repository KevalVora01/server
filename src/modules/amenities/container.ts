import { AmenityRepository } from "./infrastructure/repositories/AmenityRepository";
import { BookingRepository } from "./infrastructure/repositories/BookingRepository";
import { BlackoutRepository } from "./infrastructure/repositories/BlackoutRepository";
import { BookingVoteRepository } from "./infrastructure/repositories/BookingVoteRepository";
import { BookingConflictService } from "./infrastructure/services/BookingConflictService";
import { BookingNotifier } from "./infrastructure/services/BookingNotifier";
import { ResidentRepository } from "../residents/infrastructure/repositories/ResidentRepository";

import { CreateAmenityUseCase } from "./application/use-cases/CreateAmenityUseCase";
import { ListAmenitiesUseCase } from "./application/use-cases/ListAmenitiesUseCase";
import { GetAmenityUseCase } from "./application/use-cases/GetAmenityUseCase";
import { UpdateAmenityUseCase } from "./application/use-cases/UpdateAmenityUseCase";
import { DeactivateAmenityUseCase } from "./application/use-cases/DeactivateAmenityUseCase";
import { GetAmenityAvailabilityUseCase } from "./application/use-cases/GetAmenityAvailabilityUseCase";
import { CreateBlackoutUseCase } from "./application/use-cases/CreateBlackoutUseCase";
import { ListBlackoutsUseCase } from "./application/use-cases/ListBlackoutsUseCase";
import { DeleteBlackoutUseCase } from "./application/use-cases/DeleteBlackoutUseCase";
import { CreateBookingUseCase } from "./application/use-cases/CreateBookingUseCase";
import { ListMyBookingsUseCase } from "./application/use-cases/ListMyBookingsUseCase";
import { ListBookingsUseCase } from "./application/use-cases/ListBookingsUseCase";
import { GetBookingUseCase } from "./application/use-cases/GetBookingUseCase";
import { CancelBookingUseCase } from "./application/use-cases/CancelBookingUseCase";
import { ApproveBookingUseCase } from "./application/use-cases/ApproveBookingUseCase";
import { RejectBookingUseCase } from "./application/use-cases/RejectBookingUseCase";
import { SettleBookingUseCase } from "./application/use-cases/SettleBookingUseCase";
import { GetBookingStatsUseCase } from "./application/use-cases/GetBookingStatsUseCase";
import { GetBookingDetailUseCase } from "./application/use-cases/GetBookingDetailUseCase";
import { BulkRecordBookingVotesUseCase } from "./application/use-cases/BulkRecordBookingVotesUseCase";
import { FinalizeBookingUseCase } from "./application/use-cases/FinalizeBookingUseCase";
import { SendBookingRemindersJob } from "./application/jobs/SendBookingRemindersJob";

import { AmenityController } from "./presentation/controllers/AmenityController";
import { BookingController } from "./presentation/controllers/BookingController";

// Repositories
const amenityRepository = new AmenityRepository();
const bookingRepository = new BookingRepository();
const blackoutRepository = new BlackoutRepository();
const bookingVoteRepository = new BookingVoteRepository();
const residentRepository = new ResidentRepository();

import { CloudinaryService } from "../../shared/services/CloudinaryService";

// Services
const bookingConflictService = new BookingConflictService(blackoutRepository, bookingRepository);
const bookingNotifier = new BookingNotifier(residentRepository);
const cloudinaryService = new CloudinaryService();

// Amenity use cases
const createAmenityUseCase = new CreateAmenityUseCase(amenityRepository);
const listAmenitiesUseCase = new ListAmenitiesUseCase(amenityRepository);
const getAmenityUseCase = new GetAmenityUseCase(amenityRepository);
const updateAmenityUseCase = new UpdateAmenityUseCase(amenityRepository);
const deactivateAmenityUseCase = new DeactivateAmenityUseCase(amenityRepository);
const getAmenityAvailabilityUseCase = new GetAmenityAvailabilityUseCase(
  amenityRepository,
  bookingRepository,
  blackoutRepository
);

// Blackout use cases
const createBlackoutUseCase = new CreateBlackoutUseCase(blackoutRepository, amenityRepository);
const listBlackoutsUseCase = new ListBlackoutsUseCase(blackoutRepository);
const deleteBlackoutUseCase = new DeleteBlackoutUseCase(blackoutRepository);

// Booking use cases
const createBookingUseCase = new CreateBookingUseCase(
  bookingRepository,
  amenityRepository,
  residentRepository,
  bookingConflictService,
  bookingNotifier
);
const listMyBookingsUseCase = new ListMyBookingsUseCase(bookingRepository);
const listBookingsUseCase = new ListBookingsUseCase(bookingRepository);
const getBookingUseCase = new GetBookingUseCase(bookingRepository);
const cancelBookingUseCase = new CancelBookingUseCase(
  bookingRepository,
  bookingNotifier,
  amenityRepository
);
const approveBookingUseCase = new ApproveBookingUseCase(
  bookingRepository,
  bookingNotifier,
  amenityRepository
);
const rejectBookingUseCase = new RejectBookingUseCase(
  bookingRepository,
  bookingNotifier,
  amenityRepository
);
const settleBookingUseCase = new SettleBookingUseCase(
  bookingRepository,
  bookingNotifier,
  amenityRepository
);
const getBookingStatsUseCase = new GetBookingStatsUseCase(bookingRepository);
const getBookingDetailUseCase = new GetBookingDetailUseCase(
  bookingRepository,
  bookingVoteRepository,
  amenityRepository
);
const bulkRecordBookingVotesUseCase = new BulkRecordBookingVotesUseCase(
  bookingRepository,
  bookingVoteRepository
);
const finalizeBookingUseCase = new FinalizeBookingUseCase(
  bookingRepository,
  bookingVoteRepository,
  bookingNotifier,
  amenityRepository
);

// Jobs
export const sendBookingRemindersJob = new SendBookingRemindersJob(
  bookingRepository,
  amenityRepository,
  bookingNotifier
);

// Controllers
export const amenityController = new AmenityController(
  createAmenityUseCase,
  listAmenitiesUseCase,
  getAmenityUseCase,
  updateAmenityUseCase,
  deactivateAmenityUseCase,
  getAmenityAvailabilityUseCase,
  createBlackoutUseCase,
  listBlackoutsUseCase,
  deleteBlackoutUseCase,
  residentRepository,
  cloudinaryService
);

export const bookingController = new BookingController(
  createBookingUseCase,
  listMyBookingsUseCase,
  listBookingsUseCase,
  getBookingUseCase,
  cancelBookingUseCase,
  approveBookingUseCase,
  rejectBookingUseCase,
  settleBookingUseCase,
  getBookingStatsUseCase,
  getBookingDetailUseCase,
  bulkRecordBookingVotesUseCase,
  finalizeBookingUseCase,
  residentRepository
);
