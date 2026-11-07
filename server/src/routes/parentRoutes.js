import express from 'express';
import {
  getMyParentProfile,
  updateParentProfile,
  createChild,
  getMyChildren,
  getChildById,
  updateChild,
  deleteChild,
  uploadParentAvatar,
  getParentCart,
  toggleCartTutor
} from '../controllers/parentController.js';
import { protect, authorize } from '../middleware/auth.js';
import { uploadAvatar } from '../middleware/upload.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.use(protect);

router.get('/profile', authorize(ROLES.PARENT, ROLES.ADMIN), getMyParentProfile);
router.put('/profile', authorize(ROLES.PARENT), updateParentProfile);
router.post('/avatar', authorize(ROLES.PARENT), uploadAvatar.single('avatar'), uploadParentAvatar);

router.post('/children', authorize(ROLES.PARENT), createChild);
router.get('/children', authorize(ROLES.PARENT), getMyChildren);
router.get('/children/:id', getChildById);
router.put('/children/:id', authorize(ROLES.PARENT), updateChild);
router.delete('/children/:id', authorize(ROLES.PARENT), deleteChild);

// Tutor Cart for Parents
router.get('/cart', authorize(ROLES.PARENT), getParentCart);
router.post('/cart/toggle', authorize(ROLES.PARENT), toggleCartTutor);

export default router;
