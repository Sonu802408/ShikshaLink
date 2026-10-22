import { User } from '../models/User.js';
import { TutorProfile } from '../models/TutorProfile.js';
import { ParentProfile } from '../models/ParentProfile.js';
import { TutorQualification } from '../models/TutorQualification.js';
import { TuitionRequirement } from '../models/TuitionRequirement.js';
import { Booking } from '../models/Booking.js';
import { Review } from '../models/Review.js';
import { SupportTicket } from '../models/SupportTicket.js';
import { PlatformSettings } from '../models/PlatformSettings.js';
import { AuditLog } from '../models/AuditLog.js';
import { createNotification } from '../services/notificationService.js';
import { BOOKING_STATUSES } from '../config/constants.js';

// Platform Analytics & Metrics
export const getAdminMetrics = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalParents,
      totalTutors,
      pendingVerifications,
      totalRequirements,
      totalBookings,
      confirmedBookings,
      completedBookings,
      openComplaints
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'parent' }),
      User.countDocuments({ role: 'tutor' }),
      TutorQualification.countDocuments({ verificationStatus: 'pending' }),
      TuitionRequirement.countDocuments(),
      Booking.countDocuments(),
      Booking.countDocuments({ status: BOOKING_STATUSES.CONFIRMED }),
      Booking.countDocuments({ status: { $in: [BOOKING_STATUSES.COMPLETED, BOOKING_STATUSES.DEMO_COMPLETED] } }),
      SupportTicket.countDocuments({ status: 'open' })
    ]);

    res.json({
      success: true,
      metrics: {
        totalUsers,
        totalParents,
        totalTutors,
        pendingVerifications,
        totalRequirements,
        totalBookings,
        confirmedBookings,
        completedBookings,
        openComplaints
      }
    });
  } catch (err) {
    next(err);
  }
};

// Verification Queue: List submitted qualifications
export const getVerificationQueue = async (req, res, next) => {
  try {
    const { status = 'pending' } = req.query;
    const filter = status === 'all' ? {} : { verificationStatus: status };

    const queue = await TutorQualification.find(filter)
      .populate('tutor', 'headline primaryLocality yearsOfExperience verificationBadges')
      .populate('tutorUser', 'name email phone avatar')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: queue.length,
      queue
    });
  } catch (err) {
    next(err);
  }
};

// Review & Decide on Tutor Qualification Document
export const decideQualification = async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body;
    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be verified or rejected.' });
    }

    const qualification = await TutorQualification.findById(req.params.id);
    if (!qualification) {
      return res.status(404).json({ success: false, message: 'Qualification not found.' });
    }

    qualification.verificationStatus = status;
    qualification.adminNotes = adminNotes || '';
    qualification.verifiedAt = new Date();
    qualification.verifiedBy = req.user.id;
    await qualification.save();

    // Check if tutor now has at least one verified qualification
    const tutorProfile = await TutorProfile.findById(qualification.tutor);
    if (tutorProfile) {
      if (status === 'verified') {
        tutorProfile.verificationBadges.qualificationVerified = true;
      } else {
        // If rejected, check if there are any other verified qualifications
        const remainingVerified = await TutorQualification.countDocuments({
          tutor: tutorProfile._id,
          verificationStatus: 'verified'
        });
        tutorProfile.verificationBadges.qualificationVerified = remainingVerified > 0;
      }
      await tutorProfile.save();
    }

    // Audit log
    await AuditLog.create({
      action: `QUALIFICATION_${status.toUpperCase()}`,
      performedBy: req.user.id,
      targetType: 'TutorQualification',
      targetId: qualification._id.toString(),
      details: { degree: qualification.degree, status, notes: adminNotes }
    });

    // Notify tutor
    createNotification({
      recipient: qualification.tutorUser,
      title: `Qualification Document ${status === 'verified' ? 'Approved' : 'Needs Attention'}`,
      message: `Your document for '${qualification.degree}' has been ${status}. ${adminNotes ? 'Note: ' + adminNotes : ''}`,
      type: 'verification',
      link: '/tutor/qualifications'
    });

    res.json({
      success: true,
      message: `Qualification has been marked as ${status}.`,
      qualification
    });
  } catch (err) {
    next(err);
  }
};

// Update Tutor Verification Badges (ID check, background check)
export const updateTutorBadges = async (req, res, next) => {
  try {
    const { idDocumentVerified, backgroundChecked, auditNotes } = req.body;
    const tutor = await TutorProfile.findById(req.params.id);
    if (!tutor) {
      return res.status(404).json({ success: false, message: 'Tutor profile not found.' });
    }

    if (idDocumentVerified !== undefined) {
      tutor.verificationBadges.idDocumentVerified = Boolean(idDocumentVerified);
    }

    if (backgroundChecked !== undefined) {
      tutor.verificationBadges.backgroundChecked = Boolean(backgroundChecked);
    }

    await tutor.save();

    await AuditLog.create({
      action: 'TUTOR_BADGES_UPDATED',
      performedBy: req.user.id,
      targetType: 'TutorProfile',
      targetId: tutor._id.toString(),
      details: { badges: tutor.verificationBadges, notes: auditNotes }
    });

    res.json({
      success: true,
      message: 'Tutor verification badges updated.',
      badges: tutor.verificationBadges
    });
  } catch (err) {
    next(err);
  }
};

// Manage Users: List users with filters
export const getAllUsers = async (req, res, next) => {
  try {
    const { role, status, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role) query.role = role;
    if (status) query.status = status;
    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [{ name: regex }, { email: regex }, { phone: regex }];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      users
    });
  } catch (err) {
    next(err);
  }
};

// Suspend or Unsuspend User
export const toggleUserStatus = async (req, res, next) => {
  try {
    const { status, reason } = req.body;
    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be active or suspended.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot suspend an administrator account.' });
    }

    user.status = status;
    user.suspendedReason = status === 'suspended' ? (reason || 'Violation of community policies.') : '';
    await user.save();

    await AuditLog.create({
      action: `USER_${status.toUpperCase()}`,
      performedBy: req.user.id,
      targetType: 'User',
      targetId: user._id.toString(),
      details: { email: user.email, reason }
    });

    res.json({
      success: true,
      message: `User account is now ${status}.`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        status: user.status
      }
    });
  } catch (err) {
    next(err);
  }
};

// Manage Support Tickets
export const getAllTickets = async (req, res, next) => {
  try {
    const { status, type } = req.query;
    const query = {};
    if (status) query.status = status;
    if (type) query.ticketType = type;

    const tickets = await SupportTicket.find(query)
      .populate('user', 'name email phone role')
      .populate('booking', 'subject classGrade schedule status')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      tickets
    });
  } catch (err) {
    next(err);
  }
};

// Resolve Support Ticket
export const resolveTicket = async (req, res, next) => {
  try {
    const { status, resolution, adminNotes } = req.body;
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found.' });
    }

    if (status) ticket.status = status;
    if (resolution) ticket.resolution = resolution;
    if (adminNotes) ticket.adminNotes = adminNotes;
    ticket.resolvedBy = req.user.id;

    await ticket.save();

    createNotification({
      recipient: ticket.user,
      title: `Support Ticket Updated: ${ticket.subject}`,
      message: `Your ticket has been marked as ${ticket.status}. ${resolution ? 'Resolution: ' + resolution : ''}`,
      type: 'system',
      link: '/parent/support'
    });

    res.json({
      success: true,
      message: 'Support ticket updated.',
      ticket
    });
  } catch (err) {
    next(err);
  }
};

// Moderate Reviews
export const getAllReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find()
      .populate('parentUser', 'name email')
      .populate('tutorUser', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      reviews
    });
  } catch (err) {
    next(err);
  }
};

export const moderateReview = async (req, res, next) => {
  try {
    const { moderationStatus, moderationNote, isPublished } = req.body;
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    if (moderationStatus) review.moderationStatus = moderationStatus;
    if (moderationNote !== undefined) review.moderationNote = moderationNote;
    if (isPublished !== undefined) review.isPublished = isPublished;

    await review.save();

    res.json({
      success: true,
      message: 'Review moderation updated.',
      review
    });
  } catch (err) {
    next(err);
  }
};

// Platform Settings
export const getPlatformSettings = async (req, res, next) => {
  try {
    let settings = await PlatformSettings.findOne({ singletonKey: 'global_settings' });
    if (!settings) {
      settings = await PlatformSettings.create({});
    }
    res.json({
      success: true,
      settings
    });
  } catch (err) {
    next(err);
  }
};

export const updatePlatformSettings = async (req, res, next) => {
  try {
    let settings = await PlatformSettings.findOne({ singletonKey: 'global_settings' });
    if (!settings) {
      settings = new PlatformSettings({});
    }

    const {
      platformName,
      supportEmail,
      supportPhone,
      supportedLocalities,
      supportedClasses,
      supportedBoards,
      supportedSubjects,
      cancellationPolicyText,
      safetyPolicyText
    } = req.body;

    if (platformName) settings.platformName = platformName;
    if (supportEmail) settings.supportEmail = supportEmail;
    if (supportPhone) settings.supportPhone = supportPhone;
    if (supportedLocalities) settings.supportedLocalities = supportedLocalities;
    if (supportedClasses) settings.supportedClasses = supportedClasses;
    if (supportedBoards) settings.supportedBoards = supportedBoards;
    if (supportedSubjects) settings.supportedSubjects = supportedSubjects;
    if (cancellationPolicyText) settings.cancellationPolicyText = cancellationPolicyText;
    if (safetyPolicyText) settings.safetyPolicyText = safetyPolicyText;

    await settings.save();

    res.json({
      success: true,
      message: 'Platform settings updated successfully.',
      settings
    });
  } catch (err) {
    next(err);
  }
};

// Audit Logs
export const getAuditLogs = async (req, res, next) => {
  try {
    const logs = await AuditLog.find()
      .populate('performedBy', 'name email role')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      logs
    });
  } catch (err) {
    next(err);
  }
};
