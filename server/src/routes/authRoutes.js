import express from 'express';
import {
  register,
  login,
  getMe,
  updateMe,
  bootstrapAdmin,
  resetPassword,
  heartbeat,
  logout
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { uploadAvatar } from '../middleware/upload.js';

const router = express.Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', protect, logout);
router.post('/heartbeat', protect, heartbeat);
router.post('/reset-password', authLimiter, resetPassword);
router.get('/me', protect, getMe);
router.put('/me', protect, uploadAvatar.single('avatar'), updateMe);
router.post('/bootstrap-admin', authLimiter, bootstrapAdmin);

export default router;
