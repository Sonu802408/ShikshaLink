import express from 'express';
import {
  getPublicTutors,
  getPublicTutorById,
  getMyTutorProfile,
  updateMyTutorProfile,
  updateAvailability,
  uploadQualification,
  deleteQualification,
  getSecureDocument
} from '../controllers/tutorController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';
import { uploadDocument } from '../middleware/upload.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

// Public discovery
router.get('/', optionalAuth, getPublicTutors);
router.get('/:id/public', optionalAuth, getPublicTutorById);

// Tutor Private management
router.get('/profile/me', protect, authorize(ROLES.TUTOR, ROLES.ADMIN), getMyTutorProfile);
router.put('/profile/me', protect, authorize(ROLES.TUTOR), updateMyTutorProfile);
router.put('/availability/me', protect, authorize(ROLES.TUTOR), updateAvailability);

// Qualifications
router.post('/qualifications', protect, authorize(ROLES.TUTOR), uploadDocument.single('document'), uploadQualification);
router.delete('/qualifications/:id', protect, authorize(ROLES.TUTOR, ROLES.ADMIN), deleteQualification);

// Secure document viewing (only owner or admin)
router.get('/qualifications/:id/document', protect, getSecureDocument);

export default router;
