import { Router } from 'express';
import authRoutes from './modules/auth/presentation/routes/authRoutes';

const router = Router();

// ─── Auth ─────────────────────────────────────────────────────────
router.use('/auth', authRoutes);

// ─── Add more modules here as you build them ──────────────────────
// router.use('/apartments', apartmentRoutes);
// router.use('/residents',  residentRoutes);
// router.use('/complaints', complaintRoutes);
// router.use('/notices',    noticeRoutes);
// router.use('/invoices',   invoiceRoutes);
// router.use('/events',     eventRoutes);
// router.use('/visitors',   visitorRoutes);
// router.use('/dashboard',  dashboardRoutes);

export default router;