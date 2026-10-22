import express from 'express';
import {
  createReview,
  replyToReview,
  getMyReviews
} from '../controllers/reviewController.js';
import { protect, authorize } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.use(protect);

router.post('/', authorize(ROLES.PARENT), createReview);
router.get('/my', getMyReviews);
router.post('/:id/reply', authorize(ROLES.TUTOR), replyToReview);

export default router;
