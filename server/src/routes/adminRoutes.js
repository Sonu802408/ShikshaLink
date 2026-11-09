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
  getAuditLogs,
  getAllTutorApplications,
  getTutorApplicationById,
  updateTutorApplicationStatus,
  toggleTutorCartStatus,
  editTutorByAdmin,
  addExistingUserAsTutor,
  inviteNewTutor,
  permanentlyDeleteTutorApplication,
  deleteUser,
  decideTutorDocument
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.use(protect, authorize(ROLES.ADMIN));

router.get('/metrics', getAdminMetrics);
router.get('/verification-queue', getVerificationQueue);
router.patch('/qualifications/:id/decide', decideQualification);
router.patch('/tutors/:tutorId/documents/:docId/decide', decideTutorDocument);
router.patch('/tutors/:id/badges', updateTutorBadges);

// Full Tutor Management
router.get('/tutors', getAllTutorApplications);
router.get('/tutors/:id/full', getTutorApplicationById);
router.patch('/tutors/:id/status', updateTutorApplicationStatus);
router.patch('/tutors/:id/cart-toggle', toggleTutorCartStatus);
router.patch('/tutors/:id/edit', editTutorByAdmin);
router.post('/tutors/create-from-user', addExistingUserAsTutor);
router.post('/tutors/invite', inviteNewTutor);
router.delete('/tutors/:id/permanent', permanentlyDeleteTutorApplication);

router.get('/users', getAllUsers);
router.patch('/users/:id/status', toggleUserStatus);
router.delete('/users/:id', deleteUser);

router.get('/tickets', getAllTickets);
router.patch('/tickets/:id/resolve', resolveTicket);

router.get('/reviews', getAllReviews);
router.patch('/reviews/:id/moderate', moderateReview);

router.get('/settings', getPlatformSettings);
router.put('/settings', updatePlatformSettings);

router.get('/audit-logs', getAuditLogs);

export default router;
