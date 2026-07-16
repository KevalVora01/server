import { Router } from 'express';
import authRoutes from './modules/auth/presentation/routes/authRoutes';
import residentRoutes from './modules/residents/presentation/routes/ResidentRoutes';
import apartmentRoutes from './modules/apartments/presentation/routes/apartmentRoutes';
import familyMemberRoutes from './modules/family-members/presentation/routes/familyMemberRoutes';
import vehicleRoutes from './modules/vehicles/presentation/routes/vehicleRoutes';
import noticeRoutes from './modules/notices/presentation/routes/noticeRoutes';
import complaintRoutes from './modules/complaints/presentation/routes/complaintRoutes';
import notificationRoutes from './modules/notifications/presentation/routes/notificationRoutes';
import maintenanceRoutes from './modules/maintenance/presentation/routes/maintenanceRoutes';
import apartmentFamilyMembersRoutes from './modules/family-members/presentation/routes/apartmentFamilyMembersRoutes';
import apartmentVehiclesRoutes from './modules/vehicles/presentation/routes/apartmentVehiclesRoutes';

const router = Router();

// ─── Auth ─────────────────────────────────────────────────────────
router.use('/auth', authRoutes);

router.use('/residents', residentRoutes);

router.use('/apartments', apartmentRoutes);

router.use('/residents/:residentId/family-members', familyMemberRoutes);

router.use("/family-members", apartmentFamilyMembersRoutes);

router.use('/residents/:residentId/vehicles', vehicleRoutes);

router.use("/vehicles", apartmentVehiclesRoutes);

router.use('/notices', noticeRoutes);

router.use('/complaints', complaintRoutes);

router.use("/maintenance", maintenanceRoutes);

router.use("/notifications", notificationRoutes);

// ─── Add more modules here as you build them ──────────────────────
// router.use('/invoices',   invoiceRoutes);
// router.use('/events',     eventRoutes);
// router.use('/visitors',   visitorRoutes);
// router.use('/dashboard',  dashboardRoutes);

export default router;