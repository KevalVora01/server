import { Router } from 'express';
import authRoutes from './modules/auth/presentation/routes/authRoutes';
import residentRoutes from './modules/residents/presentation/routes/ResidentRoutes';
import apartmentRoutes from './modules/apartments/presentation/routes/apartmentRoutes';

const router = Router();

// ─── Auth ─────────────────────────────────────────────────────────
router.use('/auth', authRoutes);

router.use('/residents',  residentRoutes);

router.use("/apartments", apartmentRoutes);

// ─── Add more modules here as you build them ──────────────────────
// router.use('/complaints', complaintRoutes);
// router.use('/notices',    noticeRoutes);
// router.use('/invoices',   invoiceRoutes);
// router.use('/events',     eventRoutes);
// router.use('/visitors',   visitorRoutes);
// router.use('/dashboard',  dashboardRoutes);

export default router;