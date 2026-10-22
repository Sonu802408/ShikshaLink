import express from 'express';
import {
  createBooking,
  getMyBookings,
  acceptBooking,
  proposeAlternativeSchedule,
  respondToAlternative,
  updateMeetingLink,
  markBookingCompleted,
  cancelBooking
} from '../controllers/bookingController.js';
import { protect, authorize } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.use(protect);

router.post('/', authorize(ROLES.PARENT), createBooking);
router.get('/my', getMyBookings);
router.patch('/:id/accept', authorize(ROLES.TUTOR), acceptBooking);
router.patch('/:id/propose-alternative', authorize(ROLES.TUTOR), proposeAlternativeSchedule);
router.patch('/:id/respond-alternative', authorize(ROLES.PARENT), respondToAlternative);
router.patch('/:id/meeting-link', authorize(ROLES.TUTOR), updateMeetingLink);
router.patch('/:id/complete', markBookingCompleted);
router.patch('/:id/cancel', cancelBooking);

export default router;
