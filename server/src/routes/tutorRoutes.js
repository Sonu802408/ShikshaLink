import express from 'express';
import {
  getPublicTutors,
  getPublicTutorById,
  getMyTutorProfile,
  updateMyTutorProfile,
  getTutorCart,
  withdrawTutorApplication,
  reactivateTutorApplication,
  saveTutorDraft,
  submitTutorProfile,
  uploadTutorDocument,
  deleteTutorDocument,
  updateAvailability,
  uploadQualification,
  deleteQualification,
  getSecureDocument,
  uploadTutorAvatar
} from '../controllers/tutorController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';
import { uploadDocument, uploadAvatar } from '../middleware/upload.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

// Public discovery
router.get('/', optionalAuth, getPublicTutors);
router.get('/:id/public', optionalAuth, getPublicTutorById);

// Tutor Private management & registration (allow tutors, admins, and parents applying to become tutors)
router.get('/profile/me', protect, authorize(ROLES.TUTOR, ROLES.ADMIN, ROLES.PARENT), getMyTutorProfile);
router.get('/cart', protect, authorize(ROLES.TUTOR, ROLES.ADMIN, ROLES.PARENT), getTutorCart);
router.post('/cart/withdraw', protect, authorize(ROLES.TUTOR, ROLES.ADMIN, ROLES.PARENT), withdrawTutorApplication);
router.post('/cart/reactivate', protect, authorize(ROLES.TUTOR, ROLES.ADMIN, ROLES.PARENT), reactivateTutorApplication);
router.put('/profile/me', protect, authorize(ROLES.TUTOR, ROLES.ADMIN, ROLES.PARENT), uploadAvatar.single('avatar'), updateMyTutorProfile);
router.put('/draft', protect, authorize(ROLES.TUTOR, ROLES.ADMIN, ROLES.PARENT), saveTutorDraft);
router.post('/submit', protect, authorize(ROLES.TUTOR, ROLES.ADMIN, ROLES.PARENT), submitTutorProfile);
router.post('/upload-document', protect, authorize(ROLES.TUTOR, ROLES.ADMIN, ROLES.PARENT), uploadDocument.single('document'), uploadTutorDocument);
router.delete('/documents/:id', protect, authorize(ROLES.TUTOR, ROLES.ADMIN, ROLES.PARENT), deleteTutorDocument);
router.post('/avatar', protect, authorize(ROLES.TUTOR, ROLES.ADMIN, ROLES.PARENT), uploadAvatar.single('avatar'), uploadTutorAvatar);
router.put('/availability/me', protect, authorize(ROLES.TUTOR, ROLES.ADMIN, ROLES.PARENT), updateAvailability);

// Qualifications
router.post('/qualifications', protect, authorize(ROLES.TUTOR, ROLES.ADMIN, ROLES.PARENT), uploadDocument.single('document'), uploadQualification);
router.delete('/qualifications/:id', protect, authorize(ROLES.TUTOR, ROLES.ADMIN, ROLES.PARENT), deleteQualification);

// Secure document viewing (only owner or admin)
router.get('/qualifications/:id/document', protect, getSecureDocument);
router.get('/documents/:id', protect, getSecureDocument);

export default router;
