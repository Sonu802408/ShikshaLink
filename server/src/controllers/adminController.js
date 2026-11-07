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

// Verification Queue: List submitted qualifications & pending tutor applications
export const getVerificationQueue = async (req, res, next) => {
  try {
    const { status = 'pending' } = req.query;

    // 1. Fetch tutor applications matching the filter
    const tutorFilter = {};
    if (status === 'pending') {
      tutorFilter.$or = [
        { applicationStatus: { $in: ['applied', 'pending_review'] } },
        { profileStatus: 'pending_review' },
        { submittedAt: { $ne: null } }
      ];
    } else if (status === 'verified' || status === 'approved') {
      tutorFilter.$or = [
        { applicationStatus: 'approved' },
        { profileStatus: 'published' }
      ];
    } else if (status === 'draft' || status === 'drafts') {
      tutorFilter.applicationStatus = 'draft';
    } else if (status === 'rejected') {
      tutorFilter.applicationStatus = 'rejected';
    } else if (status === 'all') {
      // no filter - all tutor applications
    }

    const pendingTutors = await TutorProfile.find(tutorFilter)
      .populate('user', 'name email phone avatar createdAt status')
      .populate('reviewedBy', 'name email')
      .sort({ updatedAt: -1, createdAt: -1 });

    // 2. Fetch qualification document items
    const filter = status === 'all' ? {} : { verificationStatus: status };

    const queue = await TutorQualification.find(filter)
      .populate('tutor', 'headline primaryLocality yearsOfExperience verificationBadges')
      .populate('tutorUser', 'name email phone avatar')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: (pendingTutors?.length || 0) + (queue?.length || 0),
      pendingTutors: pendingTutors || [],
      queue: queue || []
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
    if (req.body.feeSettings) {
      settings.feeSettings = {
        ...settings.feeSettings,
        ...req.body.feeSettings
      };
    }

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

// ==========================================
// FULL TUTOR MANAGEMENT (ADMIN CONTROLS)
// ==========================================

// 1. Get all tutor applications with search & multi-filters
export const getAllTutorApplications = async (req, res, next) => {
  try {
    const {
      search,
      status,
      classGrade,
      subject,
      teachingMode,
      inCart,
      page = 1,
      limit = 20,
      sortBy = 'newest'
    } = req.query;

    const query = {};

    // Status filter
    if (status && status !== 'all') {
      if (status === 'active') {
        query.isAcceptingStudents = true;
        query.isPublished = true;
        query.applicationStatus = { $nin: ['withdrawn', 'inactive', 'rejected', 'draft'] };
      } else if (status === 'applied') {
        query.$or = [
          { applicationStatus: { $in: ['applied', 'pending_review'] } },
          { profileStatus: 'pending_review' }
        ];
      } else if (status === 'draft') {
        query.$or = [
          { applicationStatus: 'draft' },
          { profileStatus: 'draft' }
        ];
      } else {
        query.applicationStatus = status;
      }
    }

    // In Cart filter
    if (inCart !== undefined && inCart !== '') {
      query.isInCart = inCart === 'true';
    }

    // Class filter
    if (classGrade) {
      query.classes = { $in: [classGrade.trim()] };
    }

    // Subject filter
    if (subject) {
      query.subjects = { $regex: new RegExp(subject.trim(), 'i') };
    }

    // Teaching Mode filter
    if (teachingMode) {
      query.teachingModes = teachingMode.trim();
    }

    // Keyword search: search in fullName, headline, locality, applicationId, subjects
    if (search && search.trim()) {
      const s = search.trim();
      const regex = new RegExp(s, 'i');

      // Find any user matching name, email, or phone first
      const matchingUsers = await User.find({
        $or: [{ name: regex }, { email: regex }, { phone: regex }]
      }).select('_id');
      const userIds = matchingUsers.map(u => u._id);

      query.$or = [
        { user: { $in: userIds } },
        { fullName: regex },
        { applicationId: regex },
        { headline: regex },
        { primaryLocality: regex },
        { area: regex },
        { city: regex },
        { subjects: regex }
      ];
    }

    let sort = { updatedAt: -1, createdAt: -1 };
    if (sortBy === 'oldest') sort = { createdAt: 1 };
    else if (sortBy === 'experience') sort = { yearsOfExperience: -1 };
    else if (sortBy === 'fee_low') sort = { 'feeStructure.hourlyRate': 1 };
    else if (sortBy === 'fee_high') sort = { 'feeStructure.hourlyRate': -1 };
    else if (sortBy === 'rating') sort = { averageRating: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await TutorProfile.countDocuments(query);

    const tutors = await TutorProfile.find(query)
      .populate('user', 'name email phone avatar status createdAt')
      .populate('reviewedBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      tutors
    });
  } catch (err) {
    next(err);
  }
};

// 2. Get Single Tutor Application Full Inspection
export const getTutorApplicationById = async (req, res, next) => {
  try {
    const tutor = await TutorProfile.findById(req.params.id)
      .populate('user', 'name email phone avatar status role createdAt')
      .populate('reviewedBy', 'name email')
      .populate('statusHistory.changedBy', 'name email role');

    if (!tutor) {
      return res.status(404).json({ success: false, message: 'Tutor application not found.' });
    }

    const qualifications = await TutorQualification.find({ tutor: tutor._id })
      .populate('verifiedBy', 'name');

    const bookingsCount = await Booking.countDocuments({ tutorProfile: tutor._id });

    res.json({
      success: true,
      tutor,
      qualifications,
      bookingsCount
    });
  } catch (err) {
    next(err);
  }
};

// 3. Update Tutor Application Status (Approve, Reject, Deactivate, Restore)
export const updateTutorApplicationStatus = async (req, res, next) => {
  try {
    const { status, adminNotes = '', reason = '' } = req.body;
    const validStatuses = ['approved', 'rejected', 'inactive', 'applied', 'withdrawn', 'pending_review'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const tutor = await TutorProfile.findById(req.params.id).populate('user');
    if (!tutor) {
      return res.status(404).json({ success: false, message: 'Tutor application not found.' });
    }

    const oldStatus = tutor.applicationStatus || 'draft';
    tutor.applicationStatus = status;
    tutor.reviewedBy = req.user.id;
    tutor.reviewedAt = new Date();
    if (adminNotes) tutor.adminNotes = adminNotes;

    if (status === 'approved') {
      tutor.profileStatus = 'published';
      tutor.isPublished = true;
      tutor.isAcceptingStudents = true;
      tutor.isInCart = true;
      tutor.withdrawnAt = null;
      tutor.withdrawnReason = '';

      try {
        await createNotification({
          recipient: tutor.user?._id || tutor.user,
          title: '🎉 Profile Approved & Verified!',
          message: 'Congratulations! Your tutor profile has been verified and approved by the Administrator. Your tutor card and marketplace profile are now live!',
          type: 'verification',
          link: '/tutor/cart'
        });
      } catch (notifErr) {
        console.error('Failed to notify tutor on approval:', notifErr.message);
      }
    } else if (status === 'inactive' || status === 'withdrawn') {
      tutor.isPublished = false;
      tutor.isAcceptingStudents = false;
      tutor.isInCart = false;
      if (status === 'withdrawn') {
        tutor.withdrawnAt = new Date();
        tutor.withdrawnReason = reason || adminNotes || 'Withdrawn by administrator';
      }
    } else if (status === 'rejected') {
      tutor.isPublished = false;
      tutor.isAcceptingStudents = false;
      tutor.profileStatus = 'rejected';
    } else if (status === 'pending_review' || status === 'applied') {
      tutor.isInCart = true;
    }

    tutor.statusHistory.push({
      status,
      changedBy: req.user.id,
      reason: reason || adminNotes || `Status changed from ${oldStatus} to ${status} by administrator`
    });

    await tutor.save();

    // Audit log
    await AuditLog.create({
      action: `TUTOR_STATUS_${status.toUpperCase()}`,
      performedBy: req.user.id,
      targetType: 'TutorProfile',
      targetId: tutor._id.toString(),
      details: {
        applicationId: tutor.applicationId,
        tutorName: tutor.user?.name,
        fromStatus: oldStatus,
        toStatus: status,
        notes: adminNotes
      }
    });

    // Notify tutor user
    if (tutor.user?._id) {
      createNotification({
        recipient: tutor.user._id,
        title: `Tutor Application Update: ${status.replace('_', ' ').toUpperCase()}`,
        message: `Your tutor status has been updated to '${status}'. ${adminNotes ? 'Admin Note: ' + adminNotes : ''}`,
        type: 'verification',
        link: '/tutor'
      });
    }

    res.json({
      success: true,
      message: `Tutor application successfully updated to ${status}.`,
      tutor
    });
  } catch (err) {
    next(err);
  }
};

// 4. Toggle Tutor Cart Status
export const toggleTutorCartStatus = async (req, res, next) => {
  try {
    const { isInCart } = req.body;
    const tutor = await TutorProfile.findById(req.params.id);
    if (!tutor) {
      return res.status(404).json({ success: false, message: 'Tutor application not found.' });
    }

    tutor.isInCart = Boolean(isInCart);
    tutor.statusHistory.push({
      status: tutor.applicationStatus,
      changedBy: req.user.id,
      reason: isInCart ? 'Restored to active Tutor Cart by administrator' : 'Removed from active Tutor Cart by administrator'
    });

    await tutor.save();

    await AuditLog.create({
      action: isInCart ? 'TUTOR_CART_RESTORED' : 'TUTOR_CART_REMOVED',
      performedBy: req.user.id,
      targetType: 'TutorProfile',
      targetId: tutor._id.toString(),
      details: { applicationId: tutor.applicationId, isInCart }
    });

    res.json({
      success: true,
      message: isInCart ? 'Tutor restored to active Tutor Cart.' : 'Tutor removed from active Tutor Cart.',
      tutor
    });
  } catch (err) {
    next(err);
  }
};

// 5. Edit Tutor Profile by Admin
export const editTutorByAdmin = async (req, res, next) => {
  try {
    const tutor = await TutorProfile.findById(req.params.id);
    if (!tutor) {
      return res.status(404).json({ success: false, message: 'Tutor application not found.' });
    }

    const {
      headline,
      hourlyFee,
      monthlyFee,
      primaryLocality,
      classes,
      subjects,
      teachingModes,
      yearsOfExperience,
      adminNotes
    } = req.body;

    if (headline !== undefined) tutor.headline = headline;
    if (primaryLocality !== undefined) tutor.primaryLocality = primaryLocality;
    if (classes !== undefined) tutor.classes = classes;
    if (subjects !== undefined) tutor.subjects = subjects;
    if (teachingModes !== undefined) tutor.teachingModes = teachingModes;
    if (yearsOfExperience !== undefined) tutor.yearsOfExperience = Number(yearsOfExperience);
    if (adminNotes !== undefined) tutor.adminNotes = adminNotes;

    if (hourlyFee !== undefined) {
      tutor.hourlyFee = Number(hourlyFee);
      tutor.feeStructure = tutor.feeStructure || {};
      tutor.feeStructure.hourlyRate = Number(hourlyFee);
    }
    if (monthlyFee !== undefined) {
      tutor.monthlyFee = Number(monthlyFee);
      tutor.feeStructure = tutor.feeStructure || {};
      tutor.feeStructure.monthlyRate = Number(monthlyFee);
    }

    await tutor.save();

    await AuditLog.create({
      action: 'TUTOR_PROFILE_ADMIN_EDITED',
      performedBy: req.user.id,
      targetType: 'TutorProfile',
      targetId: tutor._id.toString(),
      details: { applicationId: tutor.applicationId, adminNotes }
    });

    res.json({
      success: true,
      message: 'Tutor profile updated by administrator.',
      tutor
    });
  } catch (err) {
    next(err);
  }
};

// 6. Add Existing Registered User as a Tutor
export const addExistingUserAsTutor = async (req, res, next) => {
  try {
    const {
      userId,
      headline = 'Academic Tutor',
      subjects = ['Mathematics'],
      classes = ['Class 10'],
      hourlyFee = 500,
      primaryLocality = 'Mayur Vihar Phase 1',
      teachingModes = ['online'],
      autoApprove = true
    } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required.' });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'Registered user not found.' });
    }

    // Check if user already has a tutor application
    let profile = await TutorProfile.findOne({ user: userId });
    const isNew = !profile;

    if (!profile) {
      profile = new TutorProfile({
        user: userId,
        fullName: targetUser.name,
        headline,
        subjects,
        classes,
        hourlyFee: Number(hourlyFee),
        feeStructure: {
          pricingModel: 'hourly',
          hourlyRate: Number(hourlyFee)
        },
        primaryLocality,
        teachingModes,
        applicationStatus: autoApprove ? 'approved' : 'applied',
        profileStatus: autoApprove ? 'published' : 'draft',
        isPublished: autoApprove,
        isAcceptingStudents: autoApprove,
        isInCart: true
      });
    } else {
      // Update existing record rather than creating a duplicate
      profile.headline = headline;
      profile.subjects = subjects;
      profile.classes = classes;
      profile.hourlyFee = Number(hourlyFee);
      profile.feeStructure = profile.feeStructure || {};
      profile.feeStructure.hourlyRate = Number(hourlyFee);
      profile.primaryLocality = primaryLocality;
      profile.teachingModes = teachingModes;
      profile.isInCart = true;
      if (autoApprove) {
        profile.applicationStatus = 'approved';
        profile.profileStatus = 'published';
        profile.isPublished = true;
        profile.isAcceptingStudents = true;
      }
    }

    // Upgrade user role if not already tutor or admin
    if (targetUser.role !== 'admin') {
      targetUser.role = 'tutor';
      await targetUser.save();
    }

    profile.statusHistory.push({
      status: profile.applicationStatus,
      changedBy: req.user.id,
      reason: `Tutor application ${isNew ? 'created' : 'reactivated'} by administrator`
    });

    await profile.save();

    await AuditLog.create({
      action: isNew ? 'TUTOR_ADDED_BY_ADMIN' : 'TUTOR_REACTIVATED_BY_ADMIN',
      performedBy: req.user.id,
      targetType: 'TutorProfile',
      targetId: profile._id.toString(),
      details: {
        userId,
        userName: targetUser.name,
        applicationId: profile.applicationId,
        autoApprove
      }
    });

    const populated = await TutorProfile.findById(profile._id).populate('user', 'name email phone avatar role');

    res.status(isNew ? 201 : 200).json({
      success: true,
      message: `User '${targetUser.name}' is now enrolled as a tutor with Application ID: ${profile.applicationId}.`,
      tutor: populated
    });
  } catch (err) {
    next(err);
  }
};

// 7. Invite New Tutor via Email (Controlled workflow)
export const inviteNewTutor = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone = '+91 98000 00000',
      subjects = ['Mathematics'],
      classes = ['Class 10'],
      hourlyFee = 500,
      primaryLocality = 'Mayur Vihar Phase 1'
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists. Use the "Add Existing User" option instead.'
      });
    }

    // Generate random secure token for initial setup
    const randomPassword = `InvitedTutor@${Math.floor(1000 + Math.random() * 9000)}`;

    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      passwordHash: randomPassword,
      role: 'tutor',
      isEmailVerified: true,
      isPhoneVerified: true
    });

    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const applicationId = `SL-TUT-${randomSuffix}`;

    const profile = await TutorProfile.create({
      user: newUser._id,
      applicationId,
      fullName: name.trim(),
      headline: `${name.trim()} - Academic Tutor`,
      subjects,
      classes,
      hourlyFee: Number(hourlyFee),
      feeStructure: {
        pricingModel: 'hourly',
        hourlyRate: Number(hourlyFee)
      },
      primaryLocality,
      applicationStatus: 'applied',
      profileStatus: 'draft',
      isInCart: true,
      statusHistory: [
        {
          status: 'applied',
          changedBy: req.user.id,
          reason: 'Application created via admin invitation workflow'
        }
      ]
    });

    await AuditLog.create({
      action: 'TUTOR_INVITED_BY_ADMIN',
      performedBy: req.user.id,
      targetType: 'TutorProfile',
      targetId: profile._id.toString(),
      details: { email, name, applicationId }
    });

    res.status(201).json({
      success: true,
      message: `Tutor invited and application registered with Application ID: ${applicationId}.`,
      tutor: profile
    });
  } catch (err) {
    next(err);
  }
};

// 8. Permanently Delete Tutor Application (Explicit Safety Confirmation)
export const permanentlyDeleteTutorApplication = async (req, res, next) => {
  try {
    const { confirmDelete } = req.body;
    if (confirmDelete !== true) {
      return res.status(400).json({
        success: false,
        message: 'Permanent deletion requires explicit confirmation (confirmDelete: true).'
      });
    }

    const tutor = await TutorProfile.findById(req.params.id);
    if (!tutor) {
      return res.status(404).json({ success: false, message: 'Tutor application not found.' });
    }

    const targetUserId = tutor.user;
    const applicationId = tutor.applicationId;

    // Remove uploaded physical qualification files if any
    const qualifications = await TutorQualification.find({ tutor: tutor._id });
    for (const q of qualifications) {
      if (q.documentPath) {
        const p = path.join(__dirname, '../../uploads/private', q.documentPath);
        if (fs.existsSync(p)) fs.unlinkSync(p);
      }
    }

    // Delete qualification records
    await TutorQualification.deleteMany({ tutor: tutor._id });

    // Delete ONLY the tutor application profile
    await tutor.deleteOne();

    // Revert user role to parent so their user account and login remain fully functional!
    if (targetUserId) {
      await User.findByIdAndUpdate(targetUserId, { role: 'parent' });
    }

    // Audit log
    await AuditLog.create({
      action: 'TUTOR_APPLICATION_PERMANENTLY_DELETED',
      performedBy: req.user.id,
      targetType: 'TutorProfile',
      targetId: req.params.id,
      details: { applicationId, userId: targetUserId?.toString() }
    });

    res.json({
      success: true,
      message: `Tutor application ${applicationId} permanently deleted. User account was preserved.`
    });
  } catch (err) {
    next(err);
  }
};
