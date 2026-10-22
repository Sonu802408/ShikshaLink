import express from 'express';
import {
  createRequirement,
  getMyRequirements,
  getRequirementById,
  updateRequirementStatus,
  getTutorRequirementsFeed
} from '../controllers/requirementController.js';
import { protect, authorize } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.use(protect);

router.post('/', authorize(ROLES.PARENT), createRequirement);
router.get('/my', authorize(ROLES.PARENT), getMyRequirements);
router.get('/feed', authorize(ROLES.TUTOR, ROLES.ADMIN), getTutorRequirementsFeed);
router.get('/:id', getRequirementById);
router.patch('/:id/status', updateRequirementStatus);

export default router;
