import crypto from 'crypto';
import { Payment } from '../models/Payment.js';
import { Booking } from '../models/Booking.js';
import { TutorPayout } from '../models/TutorPayout.js';
import { PlatformSettings } from '../models/PlatformSettings.js';
import { User } from '../models/User.js';
import { AuditLog } from '../models/AuditLog.js';
import { BOOKING_STATUSES, PAYMENT_STATUSES, PAYOUT_STATUSES, ROLES } from '../config/constants.js';
import { createNotification } from './notificationService.js';

export const generateOrderId = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `ORD_${timestamp}_${random}`;
};

export const generateUpiUri = ({ vpa, payeeName, amount, orderId, note }) => {
  const params = new URLSearchParams({
    pa: vpa || 'singhsonu883661@ybl',
    pn: payeeName || 'Sonu Kumar',
    am: Number(amount || 0).toFixed(2),
    cu: 'INR',
    tr: orderId,
    tn: note || `ShikshaLink Tuition ${orderId}`
  });
  return `upi://pay?${params.toString()}`;
};

/**
 * Calculate transparent fee breakdown based on admin PlatformSettings
 */
export const calculateFeeBreakdown = async ({ booking }) => {
  const settings = await PlatformSettings.findOne({ singletonKey: 'global_settings' });
  const paymentSettings = settings?.paymentSettings || {};
  const feeSettings = settings?.feeSettings || {};

  const durationHours = booking.schedule?.durationHours || 1;
  const hourlyRate = booking.tutorProfile?.feeStructure?.hourlyRate || booking.fee?.agreedAmount || 500;
  
  const isFreeDemo = booking.bookingType === 'demo' && booking.fee?.isDemoFree;
  const baseTutorFee = isFreeDemo ? 0 : Math.round(hourlyRate * durationHours);
  const travelCharge = (booking.teachingMode === 'student_home' && booking.tutorProfile?.homeTuitionDetails?.additionalTravelCharge) || 0;

  let platformFee = 0;
  const platformFeeType = paymentSettings.platformFeeType || 'percentage';
  const platformFeeValue = paymentSettings.platformFeeValue != null ? Number(paymentSettings.platformFeeValue) : (feeSettings.commissionPercentage || 10);

  if (!isFreeDemo) {
    if (platformFeeType === 'fixed') {
      platformFee = platformFeeValue;
    } else {
      platformFee = Math.round(baseTutorFee * (platformFeeValue / 100));
    }
  }

  const taxes = isFreeDemo ? 0 : Math.round(platformFee * 0.18);
  const discount = 0;
  const finalAmount = isFreeDemo ? 0 : (baseTutorFee + platformFee + taxes + travelCharge - discount);

  return {
    baseTutorFee,
    platformFee,
    platformFeeType,
    platformFeeValue,
    taxes,
    travelCharge,
    discount,
    finalAmount,
    currency: 'INR',
    isFreeDemo,
    paymentSettings
  };
};

/**
 * Get itemized checkout summary for parent
 */
export const getCheckoutSummary = async ({ bookingId, parentUserId }) => {
  const booking = await Booking.findById(bookingId)
    .populate('tutorUser', 'name email phone avatar')
    .populate('tutorProfile', 'headline profilePhoto feeStructure rating reviewCount city primaryLocality homeTuitionDetails')
    .populate('parentUser', 'name email phone')
    .populate('child', 'fullName classGrade board');

  if (!booking) {
    throw new Error('Booking not found');
  }

  if (booking.parentUser._id.toString() !== parentUserId.toString()) {
    throw new Error('Unauthorized to view checkout for this booking');
  }

  const breakdown = await calculateFeeBreakdown({ booking });
  const settings = await PlatformSettings.findOne({ singletonKey: 'global_settings' });
  const paymentSettings = settings?.paymentSettings || {};

  const existingPayment = await Payment.findOne({
    booking: booking._id,
    status: { $in: [PAYMENT_STATUSES.CREATED, PAYMENT_STATUSES.PENDING_VERIFICATION, PAYMENT_STATUSES.PAID] }
  }).sort({ createdAt: -1 });

  return {
    booking: {
      _id: booking._id,
      bookingType: booking.bookingType,
      teachingMode: booking.teachingMode,
      subject: booking.subject,
      classGrade: booking.classGrade,
      schedule: booking.schedule,
      status: booking.status,
      paymentStatus: booking.fee?.paymentStatus || 'awaiting_payment'
    },
    tutor: {
      id: booking.tutorUser._id,
      name: booking.tutorUser.name,
      avatar: booking.tutorProfile?.profilePhoto || booking.tutorUser.avatar || '',
      headline: booking.tutorProfile?.headline || 'Verified Educator',
      city: booking.tutorProfile?.city || 'Delhi NCR',
      primaryLocality: booking.tutorProfile?.primaryLocality || 'Mayur Vihar',
      hourlyRate: booking.tutorProfile?.feeStructure?.hourlyRate || 500
    },
    child: booking.child ? {
      fullName: booking.child.fullName,
      classGrade: booking.child.classGrade,
      board: booking.child.board
    } : null,
    breakdown: {
      baseTutorFee: breakdown.baseTutorFee,
      platformFee: breakdown.platformFee,
      platformFeeType: breakdown.platformFeeType,
      platformFeeValue: breakdown.platformFeeValue,
      taxes: breakdown.taxes,
      travelCharge: breakdown.travelCharge,
      discount: breakdown.discount,
      finalAmount: breakdown.finalAmount,
      currency: 'INR'
    },
    paymentMethods: {
      online: {
        id: 'online_upi',
        title: 'Online Payment (UPI / QR Code)',
        description: 'Scan UPI QR code or pay via PhonePe, Google Pay, Paytm, or BHIM',
        enabled: paymentSettings.isOnlinePaymentEnabled !== false,
        statusLabel: 'Enabled'
      },
      cash: {
        id: 'cash',
        title: 'Cash Payment',
        description: 'Direct cash handover during session',
        enabled: paymentSettings.isCashPaymentEnabled === true,
        statusLabel: paymentSettings.isCashPaymentEnabled === true ? 'Enabled' : 'Currently Unavailable'
      }
    },
    upiDetails: {
      businessDisplayName: paymentSettings.businessDisplayName || 'ShikshaLink Education',
      vpa: paymentSettings.upiId || 'singhsonu883661@ybl',
      payeeName: paymentSettings.upiPayeeName || 'Sonu Kumar',
      qrCodeUrl: paymentSettings.upiQrCodeUrl || '/uploads/public/payments/phonepe-qr.png',
      paymentInstructions: paymentSettings.paymentInstructions || 'Scan QR, pay the exact amount, and enter your 12-digit UPI Reference Number / UTR below.',
      paymentVerificationMethod: paymentSettings.paymentVerificationMethod || 'manual_upi'
    },
    policies: {
      cancellationPolicyText: settings?.cancellationPolicyText || 'Reschedule available up to 4 hours prior.',
      safetyPolicyText: settings?.safetyPolicyText || 'All payments are securely escrowed until class confirmation.'
    },
    existingPayment: existingPayment ? {
      orderId: existingPayment.orderId,
      status: existingPayment.status,
      paymentMethod: existingPayment.paymentMethod,
      transactionReference: existingPayment.transactionReference,
      receiptScreenshotUrl: existingPayment.receiptScreenshotUrl,
      submittedAt: existingPayment.submittedAt,
      amount: existingPayment.amount
    } : null
  };
};

/**
 * Create a Payment Order for a Booking
 */
export const createPaymentOrder = async ({
  bookingId,
  parentUserId,
  paymentMethod = 'online_upi',
  idempotencyKey
}) => {
  // Check idempotency if key provided
  if (idempotencyKey) {
    const existing = await Payment.findOne({ idempotencyKey });
    if (existing) {
      return { payment: existing, isExisting: true };
    }
  }

  const booking = await Booking.findById(bookingId)
    .populate('tutorUser')
    .populate('tutorProfile')
    .populate('parentUser');

  if (!booking) {
    throw new Error('Booking not found');
  }

  if (booking.parentUser._id.toString() !== parentUserId.toString()) {
    throw new Error('Unauthorized to pay for this booking');
  }

  if (booking.status === BOOKING_STATUSES.CONFIRMED && booking.fee.paymentStatus === 'paid') {
    throw new Error('This booking is already paid and confirmed.');
  }

  const breakdown = await calculateFeeBreakdown({ booking });
  const paymentSettings = breakdown.paymentSettings;

  // Enforce Cash Availability Rule
  if (paymentMethod === 'cash') {
    if (!paymentSettings.isCashPaymentEnabled) {
      throw new Error('Cash payment is currently unavailable. Please select Online Payment.');
    }
  } else {
    if (paymentSettings.isOnlinePaymentEnabled === false) {
      throw new Error('Online payments are currently undergoing maintenance. Please contact support.');
    }
  }

  const orderId = generateOrderId();
  const vpa = paymentSettings.upiId || 'singhsonu883661@ybl';
  const payeeName = paymentSettings.upiPayeeName || 'Sonu Kumar';
  const qrCodeUrl = paymentSettings.upiQrCodeUrl || '/uploads/public/payments/phonepe-qr.png';
  const upiQrData = generateUpiUri({
    vpa,
    payeeName,
    amount: breakdown.finalAmount,
    orderId,
    note: `Tuition ${booking.subject} (${booking.classGrade})`
  });

  const payment = await Payment.create({
    booking: booking._id,
    parentUser: parentUserId,
    tutorUser: booking.tutorUser._id,
    orderId,
    paymentMethod,
    amount: breakdown.finalAmount,
    currency: 'INR',
    breakdown: {
      baseTutorFee: breakdown.baseTutorFee,
      platformFee: breakdown.platformFee,
      discount: breakdown.discount,
      taxes: breakdown.taxes,
      travelCharge: breakdown.travelCharge,
      finalAmount: breakdown.finalAmount
    },
    status: breakdown.isFreeDemo ? PAYMENT_STATUSES.PAID : PAYMENT_STATUSES.CREATED,
    upiDetails: {
      vpa,
      payeeName,
      qrCodeData: upiQrData,
      qrCodeUrl,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour validity
    },
    ...(idempotencyKey ? { idempotencyKey } : {}),
    isSandbox: !process.env.RAZORPAY_KEY_SECRET
  });

  // Update booking with fee breakdown & awaiting payment status
  booking.fee.baseAmount = breakdown.baseTutorFee;
  booking.fee.platformFee = breakdown.platformFee;
  booking.fee.taxes = breakdown.taxes;
  booking.fee.travelCharge = breakdown.travelCharge;
  booking.fee.totalAmount = breakdown.finalAmount;
  booking.fee.payment = payment._id;

  if (breakdown.isFreeDemo) {
    booking.status = BOOKING_STATUSES.CONFIRMED;
    booking.fee.paymentStatus = 'paid';
  } else {
    booking.status = BOOKING_STATUSES.AWAITING_PAYMENT;
    booking.fee.paymentStatus = 'awaiting_payment';
  }

  booking.statusHistory.push({
    status: booking.status,
    changedBy: parentUserId,
    notes: breakdown.isFreeDemo ? 'Free demo confirmed without payment requirement' : `Payment order created: ${orderId}`
  });

  await booking.save();

  return { payment, booking, isExisting: false };
};

/**
 * Parent Submits Manual UPI Payment (UTR & Optional Receipt)
 * Sets status to Pending Verification. NEVER automatically confirms booking.
 */
export const submitManualUpiPayment = async ({
  orderId,
  paymentId,
  transactionReference,
  parentSubmissionNotes = '',
  receiptScreenshotUrl = '',
  userId
}) => {
  if (!transactionReference || transactionReference.trim().length < 4) {
    throw new Error('Please enter a valid UPI Transaction / Reference ID (UTR).');
  }

  const query = orderId ? { orderId } : { _id: paymentId };
  const payment = await Payment.findOne(query).populate('booking');

  if (!payment) {
    throw new Error('Payment order not found');
  }

  if (payment.parentUser.toString() !== userId.toString()) {
    throw new Error('Unauthorized to submit details for this payment order');
  }

  if (payment.status === PAYMENT_STATUSES.PAID) {
    throw new Error('This payment has already been verified and marked as paid.');
  }

  const cleanUtr = transactionReference.trim();

  // Guard against duplicate / replay submissions of the same UTR across different orders
  const duplicate = await Payment.findOne({
    transactionReference: cleanUtr,
    _id: { $ne: payment._id },
    status: { $in: [PAYMENT_STATUSES.PAID, PAYMENT_STATUSES.PENDING_VERIFICATION] }
  });

  if (duplicate) {
    throw new Error('This UPI Reference Number has already been submitted for another booking. Please check your transaction receipt.');
  }

  // Update payment record to pending_verification
  payment.status = PAYMENT_STATUSES.PENDING_VERIFICATION;
  payment.transactionReference = cleanUtr;
  payment.paymentMethod = 'online_upi';
  payment.parentSubmissionNotes = parentSubmissionNotes.trim();
  if (receiptScreenshotUrl) {
    payment.receiptScreenshotUrl = receiptScreenshotUrl;
  }
  payment.submittedAt = new Date();
  await payment.save();

  // Update booking
  const booking = await Booking.findById(payment.booking);
  if (booking) {
    booking.fee.paymentStatus = 'pending_verification';
    booking.statusHistory.push({
      status: booking.status,
      changedBy: userId,
      notes: `Manual UPI payment submitted with UTR: ${cleanUtr}. Awaiting admin verification.`
    });
    await booking.save();
  }

  // Dispatch In-App Notification to Parent
  await createNotification({
    recipient: userId,
    title: 'Payment Submitted for Verification ⏳',
    message: `We received your payment reference (${cleanUtr}) of ₹${payment.amount}. Your booking will be confirmed immediately once verified by our team.`,
    type: 'payment',
    link: '/parent/bookings'
  });

  // Notify Admins
  try {
    const adminUsers = await User.find({ role: ROLES.ADMIN }).select('_id');
    for (const admin of adminUsers) {
      await createNotification({
        recipient: admin._id,
        title: 'New UPI Payment Verification Pending 🔔',
        message: `Payment order ${payment.orderId} (₹${payment.amount}) submitted with UTR ${cleanUtr}. Please verify in Payment Ledger.`,
        type: 'verification',
        link: '/admin/payments'
      });
    }
  } catch (err) {
    console.error('Failed to notify admins of payment submission:', err);
  }

  return { payment, booking };
};

/**
 * Admin Verifies or Rejects a Manual UPI Payment
 */
export const adminVerifyManualPayment = async ({
  paymentId,
  action, // 'approve' or 'reject'
  adminNotes = '',
  rejectionReason = '',
  adminUserId
}) => {
  const payment = await Payment.findById(paymentId)
    .populate('parentUser')
    .populate('tutorUser')
    .populate('booking');

  if (!payment) {
    throw new Error('Payment record not found');
  }

  const booking = await Booking.findById(payment.booking);
  if (!booking) {
    throw new Error('Associated booking not found');
  }

  if (action === 'approve') {
    if (payment.status === PAYMENT_STATUSES.PAID) {
      return { payment, booking, alreadyProcessed: true };
    }

    // Mark Payment as PAID
    payment.status = PAYMENT_STATUSES.PAID;
    payment.verifiedBy = adminUserId;
    payment.verifiedAt = new Date();
    payment.adminNotes = adminNotes || 'Verified and approved by admin';
    payment.paymentId = payment.paymentId || payment.transactionReference || `UPI_VERIFIED_${Date.now()}`;
    await payment.save();

    // Confirm Booking
    booking.status = BOOKING_STATUSES.CONFIRMED;
    booking.fee.paymentStatus = 'paid';
    booking.fee.payment = payment._id;
    booking.statusHistory.push({
      status: BOOKING_STATUSES.CONFIRMED,
      changedBy: adminUserId,
      notes: `Payment approved by admin (${adminNotes || 'Valid UPI UTR verified'}). Booking confirmed.`
    });
    await booking.save();

    // Accrue Tutor Payout Record
    const settings = await PlatformSettings.findOne({ singletonKey: 'global_settings' });
    const commissionPercent = settings?.feeSettings?.commissionPercentage || 10;
    const gross = payment.breakdown.baseTutorFee;
    const platformCommission = Math.round(gross * (commissionPercent / 100));
    const netTutorPayable = gross - platformCommission;

    await TutorPayout.create({
      tutorUser: payment.tutorUser._id,
      tutorProfile: booking.tutorProfile,
      booking: booking._id,
      payment: payment._id,
      grossAmount: gross,
      platformCommission,
      commissionRatePercent: commissionPercent,
      netPayableToTutor: netTutorPayable,
      status: PAYOUT_STATUSES.ACCRUED,
      payoutMethod: 'upi',
      adminNotes: `Accrued upon admin verification (${payment.transactionReference || payment.orderId}).`
    });

    // Notify Parent
    await createNotification({
      recipient: payment.parentUser._id,
      title: 'Payment Approved & Booking Confirmed! 🎉',
      message: `Your payment of ₹${payment.amount} for ${booking.subject} has been verified! Class is confirmed for ${new Date(booking.schedule.sessionDate).toLocaleDateString()} at ${booking.schedule.startTime}.`,
      type: 'payment',
      link: '/parent/bookings'
    });

    // Notify Tutor
    await createNotification({
      recipient: payment.tutorUser._id,
      title: 'New Confirmed Tuition Booking! 📚',
      message: `${payment.parentUser.name} has completed payment for ${booking.subject} (${booking.classGrade}). Session is confirmed.`,
      type: 'booking_status',
      link: '/tutor/bookings'
    });

    // Audit Log
    await AuditLog.create({
      performedBy: adminUserId,
      action: 'PAYMENT_VERIFIED_MANUAL_ADMIN',
      targetType: 'Payment',
      targetId: payment._id.toString(),
      details: {
        orderId: payment.orderId,
        amount: payment.amount,
        transactionReference: payment.transactionReference,
        adminNotes
      }
    });

    return { payment, booking, action: 'approve' };
  } else if (action === 'reject') {
    const reason = rejectionReason || 'Invalid transaction reference or unconfirmed UPI transfer.';
    
    payment.status = PAYMENT_STATUSES.REJECTED;
    payment.verifiedBy = adminUserId;
    payment.verifiedAt = new Date();
    payment.rejectionReason = reason;
    payment.adminNotes = adminNotes || '';
    await payment.save();

    booking.fee.paymentStatus = 'awaiting_payment';
    booking.statusHistory.push({
      status: booking.status,
      changedBy: adminUserId,
      notes: `Manual UPI payment rejected: ${reason}`
    });
    await booking.save();

    // Notify Parent with rejection reason
    await createNotification({
      recipient: payment.parentUser._id,
      title: 'Payment Verification Unsuccessful ⚠️',
      message: `Your submitted payment of ₹${payment.amount} could not be verified (${reason}). Please visit your bookings to retry with a valid UTR.`,
      type: 'payment',
      link: '/parent/bookings'
    });

    // Audit Log
    await AuditLog.create({
      performedBy: adminUserId,
      action: 'PAYMENT_REJECTED_MANUAL_ADMIN',
      targetType: 'Payment',
      targetId: payment._id.toString(),
      details: {
        orderId: payment.orderId,
        amount: payment.amount,
        rejectionReason: reason
      }
    });

    return { payment, booking, action: 'reject' };
  } else {
    throw new Error("Invalid verification action. Must be 'approve' or 'reject'.");
  }
};

/**
 * Verify Payment Server-Side via Gateway Signature or Webhook
 */
export const verifyAndFinalizePayment = async ({
  orderId,
  paymentId,
  gatewaySignature,
  userId,
  isSandboxSimulated = false
}) => {
  const payment = await Payment.findOne({ orderId })
    .populate('parentUser')
    .populate('tutorUser');

  if (!payment) {
    throw new Error('Payment order not found');
  }

  if (payment.status === PAYMENT_STATUSES.PAID) {
    return { payment, alreadyProcessed: true };
  }

  // Cryptographic Signature verification for production gateways
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (secret && !isSandboxSimulated) {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    if (expectedSignature !== gatewaySignature) {
      payment.status = PAYMENT_STATUSES.FAILED;
      await payment.save();
      throw new Error('Payment signature verification failed. Untrusted response.');
    }
  }

  // Update Payment record
  payment.status = PAYMENT_STATUSES.PAID;
  payment.paymentId = paymentId || `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
  payment.gatewaySignature = gatewaySignature || 'GATEWAY_VERIFIED';
  payment.gatewayResponse = {
    verifiedAt: new Date().toISOString(),
    verifier: isSandboxSimulated ? 'SANDBOX_SIMULATOR' : 'GATEWAY_WEBHOOK',
    channel: payment.paymentMethod
  };
  await payment.save();

  // Update Booking to CONFIRMED
  const booking = await Booking.findById(payment.booking);
  if (booking) {
    booking.status = BOOKING_STATUSES.CONFIRMED;
    booking.fee.paymentStatus = 'paid';
    booking.fee.payment = payment._id;
    booking.statusHistory.push({
      status: BOOKING_STATUSES.CONFIRMED,
      changedBy: userId || payment.parentUser._id,
      notes: `Payment verified (${payment.paymentId}). Booking confirmed.`
    });
    await booking.save();

    // Accrue Tutor Payout Record
    const settings = await PlatformSettings.findOne({ singletonKey: 'global_settings' });
    const commissionPercent = settings?.feeSettings?.commissionPercentage || 10;
    const gross = payment.breakdown.baseTutorFee;
    const platformCommission = Math.round(gross * (commissionPercent / 100));
    const netTutorPayable = gross - platformCommission;

    await TutorPayout.create({
      tutorUser: payment.tutorUser._id,
      tutorProfile: booking.tutorProfile,
      booking: booking._id,
      payment: payment._id,
      grossAmount: gross,
      platformCommission,
      commissionRatePercent: commissionPercent,
      netPayableToTutor: netTutorPayable,
      status: PAYOUT_STATUSES.ACCRUED,
      payoutMethod: 'upi',
      adminNotes: 'Accrued upon verified parent payment. Subject to session completion.'
    });

    // Notify Parent
    await createNotification({
      recipient: payment.parentUser._id,
      title: 'Payment Successful & Booking Confirmed! 🎉',
      message: `Your payment of ₹${payment.amount} for ${booking.subject} has been confirmed. Class is scheduled for ${new Date(booking.schedule.sessionDate).toLocaleDateString()} at ${booking.schedule.startTime}.`,
      type: 'payment',
      link: '/parent/bookings'
    });

    // Notify Tutor
    await createNotification({
      recipient: payment.tutorUser._id,
      title: 'New Confirmed Tuition Booking! 📚',
      message: `${payment.parentUser.name} has completed payment for ${booking.subject} (${booking.classGrade}). Session scheduled for ${new Date(booking.schedule.sessionDate).toLocaleDateString()} at ${booking.schedule.startTime}.`,
      type: 'booking_status',
      link: '/tutor/bookings'
    });

    // Audit Log
    await AuditLog.create({
      performedBy: userId || payment.parentUser._id,
      action: 'PAYMENT_VERIFIED',
      targetType: 'Payment',
      targetId: payment._id.toString(),
      details: {
        orderId: payment.orderId,
        paymentId: payment.paymentId,
        amount: payment.amount,
        bookingId: booking._id
      }
    });
  }

  return { payment, booking, alreadyProcessed: false };
};

/**
 * Handle Cancellation and Refund Request
 */
export const processRefund = async ({
  bookingId,
  userId,
  reason = 'User requested cancellation',
  isAdmin = false
}) => {
  const booking = await Booking.findById(bookingId).populate('fee.payment');
  if (!booking) {
    throw new Error('Booking not found');
  }

  if ([BOOKING_STATUSES.COMPLETED, BOOKING_STATUSES.CANCELLED, BOOKING_STATUSES.REFUNDED].includes(booking.status)) {
    throw new Error(`Cannot refund a booking with status ${booking.status}`);
  }

  const payment = await Payment.findOne({ booking: booking._id, status: PAYMENT_STATUSES.PAID });

  if (payment) {
    payment.status = PAYMENT_STATUSES.REFUNDED;
    payment.refundDetails = {
      refundId: `REF_${Date.now()}_${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      refundAmount: payment.amount,
      reason,
      status: 'processed',
      refundedAt: new Date()
    };
    await payment.save();

    await TutorPayout.updateMany(
      { payment: payment._id },
      { status: PAYOUT_STATUSES.CANCELLED, adminNotes: `Cancelled due to refund (${reason})` }
    );
  }

  booking.status = payment ? BOOKING_STATUSES.REFUNDED : BOOKING_STATUSES.CANCELLED;
  booking.fee.paymentStatus = payment ? 'refunded' : 'not_applicable';
  booking.cancellationReason = reason;
  booking.cancelledBy = userId;
  booking.statusHistory.push({
    status: booking.status,
    changedBy: userId,
    notes: `Cancellation & Refund processed: ${reason}`
  });
  await booking.save();

  await AuditLog.create({
    performedBy: userId,
    action: 'REFUND_PROCESSED',
    targetType: 'Booking',
    targetId: booking._id.toString(),
    details: { reason, refundAmount: payment?.amount || 0 }
  });

  return { booking, payment };
};
