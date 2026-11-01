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

// Tutor Private management
router.get('/profile/me', protect, authorize(ROLES.TUTOR, ROLES.ADMIN), getMyTutorProfile);
router.get('/cart', protect, authorize(ROLES.TUTOR, ROLES.ADMIN, ROLES.PARENT), getTutorCart);
router.post('/cart/withdraw', protect, authorize(ROLES.TUTOR, ROLES.ADMIN), withdrawTutorApplication);
router.post('/cart/reactivate', protect, authorize(ROLES.TUTOR, ROLES.ADMIN), reactivateTutorApplication);
router.put('/profile/me', protect, authorize(ROLES.TUTOR, ROLES.ADMIN), uploadAvatar.single('avatar'), updateMyTutorProfile);
router.put('/draft', protect, authorize(ROLES.TUTOR, ROLES.ADMIN), saveTutorDraft);
router.post('/submit', protect, authorize(ROLES.TUTOR, ROLES.ADMIN), submitTutorProfile);
router.post('/upload-document', protect, authorize(ROLES.TUTOR, ROLES.ADMIN), uploadDocument.single('document'), uploadTutorDocument);
router.post('/avatar', protect, authorize(ROLES.TUTOR, ROLES.ADMIN), uploadAvatar.single('avatar'), uploadTutorAvatar);
router.put('/availability/me', protect, authorize(ROLES.TUTOR, ROLES.ADMIN), updateAvailability);

// Qualifications
router.post('/qualifications', protect, authorize(ROLES.TUTOR), uploadDocument.single('document'), uploadQualification);
router.delete('/qualifications/:id', protect, authorize(ROLES.TUTOR, ROLES.ADMIN), deleteQualification);

// Secure document viewing (only owner or admin)
router.get('/qualifications/:id/document', protect, getSecureDocument);
router.get('/documents/:id', protect, getSecureDocument);

export default router;
