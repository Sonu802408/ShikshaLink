import express from 'express';
import {
  getCheckoutSummaryController,
  createOrder,
  submitManualUpiPaymentController,
  adminVerifyManualPaymentController,
  verifyPayment,
  getPaymentReceipt,
  handleRefund,
  getTutorEarnings,
  getAdminLedger,
  settlePayout,
  getAdminPaymentSettingsController,
  updateAdminPaymentSettingsController,
  uploadAdminPaymentQrController,
  getPublicPaymentConfigController
} from '../controllers/paymentController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';
import { uploadPaymentQr, uploadReceipt } from '../middleware/upload.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

// Public payment configuration
router.get('/config/public', optionalAuth, getPublicPaymentConfigController);

// Parent & Booking Payment routes (Requires authenticated user)
router.get('/checkout/:bookingId', protect, getCheckoutSummaryController);
router.post('/create-order', protect, createOrder);
router.post('/submit-manual-upi', protect, uploadReceipt.single('receipt'), submitManualUpiPaymentController);
router.post('/verify', protect, verifyPayment);
router.get('/receipt/:bookingId', protect, getPaymentReceipt);
router.post('/refund', protect, handleRefund);

// Tutor Earnings
router.get('/tutor/earnings', protect, authorize(ROLES.TUTOR, ROLES.ADMIN), getTutorEarnings);

// Admin Payout Ledger & Settlement
router.get('/admin/ledger', protect, authorize(ROLES.ADMIN), getAdminLedger);
router.post('/admin/payout/:id/settle', protect, authorize(ROLES.ADMIN), settlePayout);

// Admin Payment Verification & Settings
router.post('/admin/verify-manual/:paymentId', protect, authorize(ROLES.ADMIN), adminVerifyManualPaymentController);
router.get('/admin/settings', protect, authorize(ROLES.ADMIN), getAdminPaymentSettingsController);
router.put('/admin/settings', protect, authorize(ROLES.ADMIN), updateAdminPaymentSettingsController);
router.post('/admin/upload-qr', protect, authorize(ROLES.ADMIN), uploadPaymentQr.single('qrCode'), uploadAdminPaymentQrController);

export default router;
