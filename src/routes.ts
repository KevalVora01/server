import { Router } from 'express';
import authRoutes from './modules/auth/presentation/routes/authRoutes';
import residentRoutes from './modules/residents/presentation/routes/ResidentRoutes';

const router = Router();

// ─── Auth ─────────────────────────────────────────────────────────
router.use('/auth', authRoutes);
router.use('/residents',  residentRoutes);

// ─── Add more modules here as you build them ──────────────────────
// router.use('/apartments', apartmentRoutes);
// router.use('/complaints', complaintRoutes);
// router.use('/notices',    noticeRoutes);
// router.use('/invoices',   invoiceRoutes);
// router.use('/events',     eventRoutes);
// router.use('/visitors',   visitorRoutes);
// router.use('/dashboard',  dashboardRoutes);

export default router;