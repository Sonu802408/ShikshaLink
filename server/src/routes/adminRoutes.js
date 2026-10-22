import express from 'express';
import {
  getAdminMetrics,
  getVerificationQueue,
  decideQualification,
  updateTutorBadges,
  getAllUsers,
  toggleUserStatus,
  getAllTickets,
  resolveTicket,
  getAllReviews,
  moderateReview,
  getPlatformSettings,
  updatePlatformSettings,
  getAuditLogs
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.use(protect, authorize(ROLES.ADMIN));

router.get('/metrics', getAdminMetrics);
router.get('/verification-queue', getVerificationQueue);
router.patch('/qualifications/:id/decide', decideQualification);
router.patch('/tutors/:id/badges', updateTutorBadges);

router.get('/users', getAllUsers);
router.patch('/users/:id/status', toggleUserStatus);

router.get('/tickets', getAllTickets);
router.patch('/tickets/:id/resolve', resolveTicket);

router.get('/reviews', getAllReviews);
router.patch('/reviews/:id/moderate', moderateReview);

router.get('/settings', getPlatformSettings);
router.put('/settings', updatePlatformSettings);

router.get('/audit-logs', getAuditLogs);

export default router;
