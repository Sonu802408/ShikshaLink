import express from 'express';
import {
  toggleSaveTutor,
  getSavedTutors,
  createSupportTicket,
  getMyTickets
} from '../controllers/supportController.js';
import { protect, authorize } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.use(protect);

router.post('/save-tutor', authorize(ROLES.PARENT), toggleSaveTutor);
router.get('/saved-tutors', authorize(ROLES.PARENT), getSavedTutors);

router.post('/tickets', createSupportTicket);
router.get('/tickets', getMyTickets);

export default router;
