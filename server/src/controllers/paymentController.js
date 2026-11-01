import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  createPaymentOrder,
  verifyAndFinalizePayment,
  processRefund,
  getCheckoutSummary,
  submitManualUpiPayment,
  adminVerifyManualPayment
} from '../services/paymentService.js';
import { Payment } from '../models/Payment.js';
import { TutorPayout } from '../models/TutorPayout.js';
import { Booking } from '../models/Booking.js';
import { PlatformSettings } from '../models/PlatformSettings.js';
import { PAYOUT_STATUSES, PAYMENT_STATUSES } from '../config/constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get Checkout Summary (Transparent fee calculation & payment methods)
export const getCheckoutSummaryController = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    if (!bookingId) {
      return res.status(400).json({ success: false, message: 'Booking ID is required.' });
    }

    const summary = await getCheckoutSummary({
      bookingId,
      parentUserId: req.user._id
    });

    res.status(200).json({
      success: true,
      summary
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

// Create Payment Order
export const createOrder = async (req, res, next) => {
  try {
    const { bookingId, paymentMethod = 'online_upi', idempotencyKey } = req.body;
    if (!bookingId) {
      return res.status(400).json({ success: false, message: 'Booking ID is required.' });
    }

    const result = await createPaymentOrder({
      bookingId,
      parentUserId: req.user._id,
      paymentMethod,
      idempotencyKey
    });

    res.status(200).json({
      success: true,
      message: 'Payment order created successfully.',
      order: {
        orderId: result.payment.orderId,
        amount: result.payment.amount,
        currency: result.payment.currency,
        breakdown: result.payment.breakdown,
        upiDetails: result.payment.upiDetails,
        isSandbox: result.payment.isSandbox,
        status: result.payment.status
      },
      booking: result.booking
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

// Parent Submits Manual UPI Payment (UTR & Optional Receipt)
export const submitManualUpiPaymentController = async (req, res, next) => {
  try {
    const { orderId, paymentId, transactionReference, parentSubmissionNotes } = req.body;

    let receiptScreenshotUrl = '';
    if (req.file) {
      receiptScreenshotUrl = `/uploads/public/payments/${req.file.filename}`;
      // Also sync to client/public/uploads/payments if available
      try {
        const clientPaymentsDir = path.join(__dirname, '../../../client/public/uploads/payments');
        if (!fs.existsSync(clientPaymentsDir)) fs.mkdirSync(clientPaymentsDir, { recursive: true });
        fs.copyFileSync(req.file.path, path.join(clientPaymentsDir, req.file.filename));
      } catch (e) {
        // Non-blocking sync error
      }
    }

    const result = await submitManualUpiPayment({
      orderId,
      paymentId,
      transactionReference,
      parentSubmissionNotes,
      receiptScreenshotUrl,
      userId: req.user._id
    });

    res.status(200).json({
      success: true,
      message: 'Your payment details have been submitted and are pending admin verification. Booking will be confirmed once verified.',
      payment: result.payment,
      booking: result.booking
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

// Admin Verifies or Rejects a Manual UPI Payment
export const adminVerifyManualPaymentController = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const { action, adminNotes, rejectionReason } = req.body;

    if (!paymentId) {
      return res.status(400).json({ success: false, message: 'Payment ID is required.' });
    }

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ success: false, message: "Action must be 'approve' or 'reject'." });
    }

    const result = await adminVerifyManualPayment({
      paymentId,
      action,
      adminNotes,
      rejectionReason,
      adminUserId: req.user._id
    });

    res.status(200).json({
      success: true,
      message: action === 'approve' ? 'Payment approved and booking confirmed successfully!' : 'Payment marked as rejected. Parent notified.',
      payment: result.payment,
      booking: result.booking
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

// Verify Payment (Gateway or Sandbox Automated)
export const verifyPayment = async (req, res, next) => {
  try {
    const { orderId, paymentId, gatewaySignature, isSandboxSimulated = false } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Order ID is required.' });
    }

    const result = await verifyAndFinalizePayment({
      orderId,
      paymentId,
      gatewaySignature,
      userId: req.user?._id,
      isSandboxSimulated
    });

    res.status(200).json({
      success: true,
      message: result.alreadyProcessed ? 'Payment already confirmed.' : 'Payment verified and booking confirmed successfully!',
      payment: result.payment,
      booking: result.booking
    });
  } catch (err) {
    next(err);
  }
};

// Get Itemized Payment Receipt
export const getPaymentReceipt = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId)
      .populate('parentUser', 'name email phone')
      .populate('tutorUser', 'name email phone')
      .populate('tutorProfile', 'headline city primaryLocality homeTuitionDetails centreDetails')
      .populate('child', 'fullName classGrade board');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    // Role check: Only parent, tutor or admin
    const isOwner = booking.parentUser._id.toString() === req.user._id.toString() ||
                    booking.tutorUser._id.toString() === req.user._id.toString() ||
                    req.user.role === 'admin';

    if (!isOwner) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to receipt.' });
    }

    const payment = await Payment.findOne({
      booking: booking._id,
      status: { $in: ['paid', 'pending_verification'] }
    });

    res.status(200).json({
      success: true,
      receipt: {
        receiptNumber: payment ? `RCP-${payment.orderId.replace('ORD_', '')}` : `RCP-DEMO-${booking._id.toString().slice(-6)}`,
        bookingId: booking._id,
        issueDate: payment?.updatedAt || booking.createdAt,
        parent: {
          name: booking.parentUser.name,
          email: booking.parentUser.email
        },
        tutor: {
          name: booking.tutorUser.name,
          headline: booking.tutorProfile?.headline
        },
        student: {
          name: booking.child?.fullName,
          classGrade: booking.classGrade,
          subject: booking.subject
        },
        session: {
          date: booking.schedule.sessionDate,
          startTime: booking.schedule.startTime,
          endTime: booking.schedule.endTime,
          durationHours: booking.schedule.durationHours || 1,
          teachingMode: booking.teachingMode
        },
        financials: payment ? payment.breakdown : {
          baseTutorFee: booking.fee?.agreedAmount || 0,
          platformFee: 0,
          taxes: 0,
          travelCharge: 0,
          finalAmount: booking.fee?.agreedAmount || 0
        },
        paymentDetails: {
          orderId: payment?.orderId || 'FREE_DEMO',
          paymentId: payment?.paymentId || payment?.transactionReference || 'PENDING_REF',
          method: payment?.paymentMethod || 'Online Payment',
          status: payment?.status || booking.fee.paymentStatus,
          transactionReference: payment?.transactionReference || ''
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

// Request Refund / Cancellation
export const handleRefund = async (req, res, next) => {
  try {
    const { bookingId, reason } = req.body;
    if (!bookingId) {
      return res.status(400).json({ success: false, message: 'Booking ID is required.' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const isAuthorized = booking.parentUser.toString() === req.user._id.toString() || req.user.role === 'admin';
    if (!isAuthorized) {
      return res.status(403).json({ success: false, message: 'Unauthorized to cancel this booking.' });
    }

    const result = await processRefund({
      bookingId,
      userId: req.user._id,
      reason: reason || 'Parent requested cancellation',
      isAdmin: req.user.role === 'admin'
    });

    res.status(200).json({
      success: true,
      message: 'Booking cancelled and refund processed successfully.',
      booking: result.booking,
      payment: result.payment
    });
  } catch (err) {
    next(err);
  }
};

// Tutor: Get Earnings & Payout Ledger
export const getTutorEarnings = async (req, res, next) => {
  try {
    const payouts = await TutorPayout.find({ tutorUser: req.user._id })
      .populate({
        path: 'booking',
        select: 'subject classGrade schedule fee status'
      })
      .sort({ createdAt: -1 });

    const totalGross = payouts.reduce((acc, p) => acc + (p.status !== 'cancelled' ? p.grossAmount : 0), 0);
    const totalCommission = payouts.reduce((acc, p) => acc + (p.status !== 'cancelled' ? p.platformCommission : 0), 0);
    const totalNetEarned = payouts.reduce((acc, p) => acc + (p.status !== 'cancelled' ? p.netPayableToTutor : 0), 0);
    const totalTransferred = payouts.reduce((acc, p) => acc + (p.status === 'transferred' ? p.netPayableToTutor : 0), 0);
    const totalPendingPayout = payouts.reduce((acc, p) => acc + (p.status === 'accrued' || p.status === 'processing' ? p.netPayableToTutor : 0), 0);

    res.status(200).json({
      success: true,
      summary: {
        totalGross,
        totalCommission,
        totalNetEarned,
        totalTransferred,
        totalPendingPayout,
        payoutCount: payouts.length
      },
      payouts
    });
  } catch (err) {
    next(err);
  }
};

// Admin: Get All Payments & Payout Ledger + Pending Verifications
export const getAdminLedger = async (req, res, next) => {
  try {
    const [payments, payouts] = await Promise.all([
      Payment.find()
        .populate('parentUser', 'name email phone')
        .populate('tutorUser', 'name email phone')
        .populate('booking', 'subject classGrade schedule status fee')
        .sort({ createdAt: -1 })
        .limit(150),
      TutorPayout.find()
        .populate('tutorUser', 'name email phone')
        .populate('booking', 'subject classGrade schedule status')
        .sort({ createdAt: -1 })
        .limit(100)
    ]);

    const totalGrossRevenue = payments.reduce((acc, p) => acc + (p.status === 'paid' ? p.amount : 0), 0);
    const totalPlatformFees = payments.reduce((acc, p) => acc + (p.status === 'paid' ? p.breakdown.platformFee : 0), 0);
    const totalTutorLiabilities = payouts.reduce((acc, p) => acc + (p.status === 'accrued' || p.status === 'processing' ? p.netPayableToTutor : 0), 0);
    const totalSettledToTutors = payouts.reduce((acc, p) => acc + (p.status === 'transferred' ? p.netPayableToTutor : 0), 0);
    const pendingVerificationsCount = payments.filter((p) => p.status === 'pending_verification').length;

    res.status(200).json({
      success: true,
      analytics: {
        totalGrossRevenue,
        totalPlatformFees,
        totalTutorLiabilities,
        totalSettledToTutors,
        pendingVerificationsCount,
        paymentCount: payments.length,
        payoutCount: payouts.length
      },
      payments,
      payouts
    });
  } catch (err) {
    next(err);
  }
};

// Admin: Settle Payout to Tutor
export const settlePayout = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { transferReference, adminNotes } = req.body;

    if (!transferReference) {
      return res.status(400).json({ success: false, message: 'Transfer reference / UTR is required to mark payout settled.' });
    }

    const payout = await TutorPayout.findById(id);
    if (!payout) {
      return res.status(404).json({ success: false, message: 'Payout record not found.' });
    }

    payout.status = PAYOUT_STATUSES.TRANSFERRED;
    payout.transferReference = transferReference;
    payout.processedAt = new Date();
    payout.processedBy = req.user._id;
    if (adminNotes) payout.adminNotes = adminNotes;

    await payout.save();

    res.status(200).json({
      success: true,
      message: 'Payout marked as transferred successfully.',
      payout
    });
  } catch (err) {
    next(err);
  }
};

// Admin: Get Payment Settings
export const getAdminPaymentSettingsController = async (req, res, next) => {
  try {
    let settings = await PlatformSettings.findOne({ singletonKey: 'global_settings' });
    if (!settings) {
      settings = await PlatformSettings.create({ singletonKey: 'global_settings' });
    }

    res.status(200).json({
      success: true,
      paymentSettings: settings.paymentSettings || {},
      feeSettings: settings.feeSettings || {}
    });
  } catch (err) {
    next(err);
  }
};

// Admin: Update Payment Settings
export const updateAdminPaymentSettingsController = async (req, res, next) => {
  try {
    const {
      businessDisplayName,
      upiId,
      upiPayeeName,
      upiQrCodeUrl,
      isOnlinePaymentEnabled,
      isCashPaymentEnabled,
      platformFeeType,
      platformFeeValue,
      paymentInstructions,
      paymentVerificationMethod
    } = req.body;

    let settings = await PlatformSettings.findOne({ singletonKey: 'global_settings' });
    if (!settings) {
      settings = new PlatformSettings({ singletonKey: 'global_settings' });
    }

    settings.paymentSettings = settings.paymentSettings || {};
    if (businessDisplayName !== undefined) settings.paymentSettings.businessDisplayName = businessDisplayName.trim();
    if (upiId !== undefined) settings.paymentSettings.upiId = upiId.trim();
    if (upiPayeeName !== undefined) settings.paymentSettings.upiPayeeName = upiPayeeName.trim();
    if (upiQrCodeUrl !== undefined) settings.paymentSettings.upiQrCodeUrl = upiQrCodeUrl.trim();
    if (isOnlinePaymentEnabled !== undefined) settings.paymentSettings.isOnlinePaymentEnabled = Boolean(isOnlinePaymentEnabled);
    if (isCashPaymentEnabled !== undefined) settings.paymentSettings.isCashPaymentEnabled = Boolean(isCashPaymentEnabled);
    if (platformFeeType !== undefined) settings.paymentSettings.platformFeeType = platformFeeType;
    if (platformFeeValue !== undefined) settings.paymentSettings.platformFeeValue = Number(platformFeeValue);
    if (paymentInstructions !== undefined) settings.paymentSettings.paymentInstructions = paymentInstructions.trim();
    if (paymentVerificationMethod !== undefined) settings.paymentSettings.paymentVerificationMethod = paymentVerificationMethod;

    await settings.save();

    res.status(200).json({
      success: true,
      message: 'Payment settings saved successfully.',
      paymentSettings: settings.paymentSettings
    });
  } catch (err) {
    next(err);
  }
};

// Admin: Upload New UPI QR Code Image
export const uploadAdminPaymentQrController = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select a valid QR code image file to upload.' });
    }

    const publicUrl = `/uploads/public/payments/${req.file.filename}`;

    // Also mirror copy to client/public/uploads/payments for local dev rendering
    try {
      const clientPaymentsDir = path.join(__dirname, '../../../client/public/uploads/payments');
      if (!fs.existsSync(clientPaymentsDir)) fs.mkdirSync(clientPaymentsDir, { recursive: true });
      fs.copyFileSync(req.file.path, path.join(clientPaymentsDir, req.file.filename));
    } catch (e) {
      // Non-blocking mirror
    }

    let settings = await PlatformSettings.findOne({ singletonKey: 'global_settings' });
    if (!settings) settings = new PlatformSettings({ singletonKey: 'global_settings' });
    settings.paymentSettings = settings.paymentSettings || {};
    settings.paymentSettings.upiQrCodeUrl = publicUrl;
    await settings.save();

    res.status(200).json({
      success: true,
      message: 'UPI QR code image uploaded and saved successfully.',
      qrCodeUrl: publicUrl
    });
  } catch (err) {
    next(err);
  }
};

// Public/Authenticated: Get Current Active Payment Config
export const getPublicPaymentConfigController = async (req, res, next) => {
  try {
    const settings = await PlatformSettings.findOne({ singletonKey: 'global_settings' });
    const p = settings?.paymentSettings || {};

    res.status(200).json({
      success: true,
      config: {
        businessDisplayName: p.businessDisplayName || 'ShikshaLink Education',
        upiId: p.upiId || 'singhsonu883661@ybl',
        upiPayeeName: p.upiPayeeName || 'Sonu Kumar',
        upiQrCodeUrl: p.upiQrCodeUrl || '/uploads/public/payments/phonepe-qr.png',
        isOnlinePaymentEnabled: p.isOnlinePaymentEnabled !== false,
        isCashPaymentEnabled: p.isCashPaymentEnabled === true,
        platformFeeType: p.platformFeeType || 'percentage',
        platformFeeValue: p.platformFeeValue != null ? p.platformFeeValue : 10,
        paymentInstructions: p.paymentInstructions || 'Scan QR, pay the exact amount, and enter your 12-digit UTR below.',
        paymentVerificationMethod: p.paymentVerificationMethod || 'manual_upi',
        cancellationPolicyText: settings?.cancellationPolicyText || '',
        safetyPolicyText: settings?.safetyPolicyText || ''
      }
    });
  } catch (err) {
    next(err);
  }
};
