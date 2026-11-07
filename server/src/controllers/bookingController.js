import { Booking } from '../models/Booking.js';
import { TutorProfile } from '../models/TutorProfile.js';
import { ParentProfile } from '../models/ParentProfile.js';
import { ChildProfile } from '../models/ChildProfile.js';
import { User } from '../models/User.js';
import { BOOKING_STATUSES } from '../config/constants.js';
import { createNotification } from '../services/notificationService.js';

// Helper: Check conflicting confirmed bookings for tutor or child
const checkBookingConflict = async (tutorUserId, childId, sessionDate, startTime, endTime, excludeBookingId = null) => {
  const startOfDay = new Date(sessionDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(sessionDate);
  endOfDay.setHours(23, 59, 59, 999);

  const query = {
    status: BOOKING_STATUSES.CONFIRMED,
    'schedule.sessionDate': { $gte: startOfDay, $lte: endOfDay },
    $or: [
      { tutorUser: tutorUserId },
      { child: childId }
    ]
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const existingBookings = await Booking.find(query);

  for (const b of existingBookings) {
    // If times overlap
    const bStart = b.schedule.startTime;
    const bEnd = b.schedule.endTime;
    if (startTime < bEnd && endTime > bStart) {
      return b;
    }
  }
  return null;
};

// Create a Booking or Demo Request (Parent)
export const createBooking = async (req, res, next) => {
  try {
    const {
      tutorProfileId,
      childId,
      teachingMode,
      bookingType = 'demo',
      subject,
      classGrade,
      sessionDate,
      startTime,
      endTime,
      studentExactAddress,
      notes
    } = req.body;

    if (!tutorProfileId || !childId || !teachingMode || !subject || !classGrade || !sessionDate || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'All booking fields (tutor, child, mode, subject, class, date, start time, end time) are required.'
      });
    }

    const tutor = await TutorProfile.findById(tutorProfileId).populate('user');
    if (!tutor) {
      return res.status(404).json({ success: false, message: 'Tutor not found.' });
    }

    if (!tutor.isAcceptingStudents || !tutor.isPublished || ['withdrawn', 'inactive', 'rejected'].includes(tutor.applicationStatus)) {
      return res.status(400).json({
        success: false,
        message: 'This tutor is not currently accepting new tuition requests.'
      });
    }

    // Check mode compatibility
    if (!tutor.teachingModes.includes(teachingMode)) {
      return res.status(400).json({
        success: false,
        message: `This tutor does not offer tuition in '${teachingMode.replace('_', ' ')}' mode.`
      });
    }

    const parentProfile = await ParentProfile.findOne({ user: req.user.id });
    const child = await ChildProfile.findById(childId);

    if (!child || child.parentUser.toString() !== req.user.id) {
      return res.status(400).json({ success: false, message: 'Invalid child selected.' });
    }

    // Check conflict
    const conflict = await checkBookingConflict(tutor.user._id, child._id, sessionDate, startTime, endTime);
    if (conflict) {
      return res.status(409).json({
        success: false,
        message: 'Time slot conflict detected. Either the tutor or student already has a confirmed session at this time.'
      });
    }

    const isDemo = bookingType === 'demo';
    const isFreeDemo = isDemo && tutor.demoClassFee === 0;

    const booking = await Booking.create({
      parentUser: req.user.id,
      parentProfile: parentProfile._id,
      tutorUser: tutor.user._id,
      tutorProfile: tutor._id,
      child: child._id,
      childSnapshot: {
        fullName: child.fullName,
        displayName: child.displayName || child.fullName,
        classGrade: child.classGrade,
        board: child.board,
        medium: child.medium || child.preferredLanguage || 'English',
        school: child.school || ''
      },
      parentSnapshot: {
        fullName: parentProfile.fullName || req.user.name,
        phone: parentProfile.phone || req.user.phone,
        email: req.user.email,
        city: parentProfile.city || 'Delhi',
        locality: parentProfile.locality || 'Mayur Vihar',
        address: studentExactAddress || parentProfile.address || ''
      },
      bookingType,
      teachingMode,
      subject,
      classGrade,
      schedule: {
        sessionDate: new Date(sessionDate),
        startTime,
        endTime
      },
      fee: {
        agreedAmount: isFreeDemo ? 0 : (tutor.feeStructure?.hourlyRate || 500),
        pricingUnit: isFreeDemo ? 'free_demo' : 'per_hour',
        isDemoFree: isFreeDemo
      },
      status: BOOKING_STATUSES.PENDING,
      homeTuitionDetails: {
        studentLocality: parentProfile.locality || 'Delhi NCR',
        studentExactAddress: studentExactAddress || parentProfile.address || '',
        parentContactPhone: parentProfile.phone || req.user.phone || ''
      },
      centreDetails: {
        centreName: tutor.centreDetails?.centreName || '',
        centreLocality: tutor.centreDetails?.locality || '',
        centreAddress: tutor.centreDetails?.fullAddress || '',
        directions: tutor.centreDetails?.directions || ''
      },
      statusHistory: [{
        status: BOOKING_STATUSES.PENDING,
        changedBy: req.user.id,
        notes: notes || 'Booking request submitted by parent.'
      }]
    });

    // Notify tutor
    createNotification({
      recipient: tutor.user._id,
      sender: req.user.id,
      title: `New ${isDemo ? 'Demo Class' : 'Tuition'} Request!`,
      message: `${req.user.name} requested a ${isDemo ? 'demo class' : 'tuition booking'} for ${subject} on ${new Date(sessionDate).toLocaleDateString()} at ${startTime}.`,
      type: 'booking_request',
      link: '/tutor/bookings'
    });

    res.status(201).json({
      success: true,
      message: 'Booking request sent to tutor.',
      booking
    });
  } catch (err) {
    next(err);
  }
};

// Get current user's bookings (Parent or Tutor)
export const getMyBookings = async (req, res, next) => {
  try {
    const isParent = req.user.role === 'parent';
    const query = isParent ? { parentUser: req.user.id } : { tutorUser: req.user.id };

    const bookings = await Booking.find(query)
      .populate('child', 'displayName fullName classGrade board')
      .populate('tutorUser', 'name email phone avatar')
      .populate('parentUser', 'name email phone avatar')
      .populate('tutorProfile', 'headline primaryLocality centreDetails')
      .sort({ createdAt: -1 });

    // Privacy Masking for unconfirmed bookings:
    // Only disclose parent contact phone & exact address to tutor if booking is accepted or confirmed!
    const sanitizedBookings = bookings.map(b => {
      const bObj = b.toObject();
      const isConfirmedOrAccepted = [
        BOOKING_STATUSES.ACCEPTED,
        BOOKING_STATUSES.CONFIRMED,
        BOOKING_STATUSES.DEMO_COMPLETED,
        BOOKING_STATUSES.IN_PROGRESS,
        BOOKING_STATUSES.COMPLETED
      ].includes(b.status);

      if (!isConfirmedOrAccepted) {
        if (!isParent) {
          // Tutor view: hide exact address & phone until confirmed
          if (bObj.homeTuitionDetails) {
            bObj.homeTuitionDetails.studentExactAddress = '[Disclosed after booking confirmation]';
            bObj.homeTuitionDetails.parentContactPhone = '[Disclosed after booking confirmation]';
          }
          if (bObj.parentUser) {
            bObj.parentUser.phone = '[Disclosed after booking confirmation]';
          }
        } else {
          // Parent view: hide centre exact address until confirmed
          if (bObj.centreDetails && bObj.centreDetails.centreAddress) {
            bObj.centreDetails.centreAddress = '[Disclosed after booking confirmation]';
          }
        }
      }
      return bObj;
    });

    res.json({
      success: true,
      bookings: sanitizedBookings
    });
  } catch (err) {
    next(err);
  }
};

// Tutor Action: Accept Booking
export const acceptBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (booking.tutorUser.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    if (booking.status !== BOOKING_STATUSES.PENDING) {
      return res.status(400).json({
        success: false,
        message: `Cannot accept booking in '${booking.status}' status.`
      });
    }

    // Re-verify no conflicts
    const conflict = await checkBookingConflict(
      booking.tutorUser,
      booking.child,
      booking.schedule.sessionDate,
      booking.schedule.startTime,
      booking.schedule.endTime,
      booking._id
    );

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: 'Cannot accept booking: another booking is already confirmed for this time slot.'
      });
    }

    booking.status = BOOKING_STATUSES.CONFIRMED;
    booking.statusHistory.push({
      status: BOOKING_STATUSES.CONFIRMED,
      changedBy: req.user.id,
      notes: 'Tutor accepted and confirmed the session schedule.'
    });

    await booking.save();

    // Notify parent
    createNotification({
      recipient: booking.parentUser,
      sender: req.user.id,
      title: 'Booking Confirmed!',
      message: `Your booking for ${booking.subject} has been confirmed by the tutor for ${new Date(booking.schedule.sessionDate).toLocaleDateString()} at ${booking.schedule.startTime}.`,
      type: 'booking_status',
      link: '/parent/bookings'
    });

    res.json({
      success: true,
      message: 'Booking confirmed successfully.',
      booking
    });
  } catch (err) {
    next(err);
  }
};

// Tutor Action: Propose Alternative Schedule
export const proposeAlternativeSchedule = async (req, res, next) => {
  try {
    const { sessionDate, startTime, endTime, notes } = req.body;
    if (!sessionDate || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Alternative session date, start time, and end time are required.'
      });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (booking.tutorUser.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    booking.status = BOOKING_STATUSES.ALTERNATIVE_PROPOSED;
    booking.proposedAlternative = {
      sessionDate: new Date(sessionDate),
      startTime,
      endTime,
      notes: notes || 'Tutor suggested a different time slot.',
      proposedBy: req.user.id
    };

    booking.statusHistory.push({
      status: BOOKING_STATUSES.ALTERNATIVE_PROPOSED,
      changedBy: req.user.id,
      notes: `Alternative proposed: ${new Date(sessionDate).toLocaleDateString()} ${startTime}-${endTime}. ${notes || ''}`
    });

    await booking.save();

    // Notify parent
    createNotification({
      recipient: booking.parentUser,
      sender: req.user.id,
      title: 'Alternative Schedule Proposed',
      message: `Tutor proposed an alternative time for your ${booking.subject} session: ${new Date(sessionDate).toLocaleDateString()} at ${startTime}. Please review.`,
      type: 'booking_status',
      link: '/parent/bookings'
    });

    res.json({
      success: true,
      message: 'Alternative schedule proposed to parent.',
      booking
    });
  } catch (err) {
    next(err);
  }
};

// Parent Action: Respond to Alternative (Accept or Reject)
export const respondToAlternative = async (req, res, next) => {
  try {
    const { accept, reason } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (booking.parentUser.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    if (booking.status !== BOOKING_STATUSES.ALTERNATIVE_PROPOSED) {
      return res.status(400).json({
        success: false,
        message: 'No alternative schedule proposal is pending for this booking.'
      });
    }

    if (accept) {
      // Overwrite schedule with proposed alternative
      booking.schedule.sessionDate = booking.proposedAlternative.sessionDate;
      booking.schedule.startTime = booking.proposedAlternative.startTime;
      booking.schedule.endTime = booking.proposedAlternative.endTime;
      booking.status = BOOKING_STATUSES.CONFIRMED;

      booking.statusHistory.push({
        status: BOOKING_STATUSES.CONFIRMED,
        changedBy: req.user.id,
        notes: 'Parent accepted proposed alternative schedule.'
      });

      // Clear proposed alternative
      booking.proposedAlternative = undefined;

      await booking.save();

      createNotification({
        recipient: booking.tutorUser,
        sender: req.user.id,
        title: 'Alternative Schedule Accepted!',
        message: `The parent accepted your proposed schedule for ${booking.subject}. Session is now confirmed.`,
        type: 'booking_status',
        link: '/tutor/bookings'
      });

      return res.json({
        success: true,
        message: 'Schedule accepted. Booking is confirmed.',
        booking
      });
    } else {
      booking.status = BOOKING_STATUSES.CANCELLED;
      booking.cancellationReason = reason || 'Parent declined proposed alternative schedule.';
      booking.cancelledBy = req.user.id;

      booking.statusHistory.push({
        status: BOOKING_STATUSES.CANCELLED,
        changedBy: req.user.id,
        notes: `Declined alternative: ${reason || 'Schedule did not suit'}`
      });

      await booking.save();

      createNotification({
        recipient: booking.tutorUser,
        sender: req.user.id,
        title: 'Alternative Schedule Declined',
        message: `The parent was unable to accommodate the proposed alternative for ${booking.subject}.`,
        type: 'booking_status',
        link: '/tutor/bookings'
      });

      return res.json({
        success: true,
        message: 'Alternative declined. Booking cancelled.',
        booking
      });
    }
  } catch (err) {
    next(err);
  }
};

// Update Online Class Meeting Link (Tutor)
export const updateMeetingLink = async (req, res, next) => {
  try {
    const { meetingLink, instructions } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (booking.tutorUser.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Only the tutor can update class meeting links.' });
    }

    if (!meetingLink || !meetingLink.startsWith('http')) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid meeting link (starting with http:// or https://).'
      });
    }

    booking.onlineDetails.meetingLink = meetingLink;
    if (instructions) booking.onlineDetails.instructions = instructions;

    await booking.save();

    createNotification({
      recipient: booking.parentUser,
      sender: req.user.id,
      title: 'Online Class Link Updated',
      message: `Your tutor provided the online class link for ${booking.subject}.`,
      type: 'booking_status',
      link: '/parent/bookings'
    });

    res.json({
      success: true,
      message: 'Meeting link saved and shared with student.',
      onlineDetails: booking.onlineDetails
    });
  } catch (err) {
    next(err);
  }
};

// Complete Booking (Demo or Regular)
export const markBookingCompleted = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const isAuthorized = booking.tutorUser.toString() === req.user.id || 
                         booking.parentUser.toString() === req.user.id || 
                         req.user.role === 'admin';

    if (!isAuthorized) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    const newStatus = booking.bookingType === 'demo' ? BOOKING_STATUSES.DEMO_COMPLETED : BOOKING_STATUSES.COMPLETED;
    booking.status = newStatus;

    booking.statusHistory.push({
      status: newStatus,
      changedBy: req.user.id,
      notes: 'Session marked as completed.'
    });

    await booking.save();

    // Notify parent to leave a review if they haven't yet
    createNotification({
      recipient: booking.parentUser,
      title: 'Tuition Session Completed!',
      message: `Your session with the tutor has concluded. Please share your rating and feedback to help other parents.`,
      type: 'review',
      link: '/parent/reviews'
    });

    res.json({
      success: true,
      message: 'Booking marked as completed.',
      booking
    });
  } catch (err) {
    next(err);
  }
};

// Cancel Booking
export const cancelBooking = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const isParent = booking.parentUser.toString() === req.user.id;
    const isTutor = booking.tutorUser.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isParent && !isTutor && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized to cancel this booking.' });
    }

    if (booking.status === BOOKING_STATUSES.COMPLETED || booking.status === BOOKING_STATUSES.CANCELLED) {
      return res.status(400).json({
        success: false,
        message: `Booking is already in '${booking.status}' status.`
      });
    }

    booking.status = BOOKING_STATUSES.CANCELLED;
    booking.cancellationReason = reason || 'Cancelled by user.';
    booking.cancelledBy = req.user.id;

    booking.statusHistory.push({
      status: BOOKING_STATUSES.CANCELLED,
      changedBy: req.user.id,
      notes: `Cancellation: ${reason || 'No specific reason given.'}`
    });

    await booking.save();

    const recipient = isParent ? booking.tutorUser : booking.parentUser;
    createNotification({
      recipient,
      sender: req.user.id,
      title: 'Booking Cancelled',
      message: `The booking for ${booking.subject} on ${new Date(booking.schedule.sessionDate).toLocaleDateString()} was cancelled. Reason: ${reason || 'Schedule changed'}`,
      type: 'booking_status',
      link: isParent ? '/tutor/bookings' : '/parent/bookings'
    });

    res.json({
      success: true,
      message: 'Booking cancelled successfully.',
      booking
    });
  } catch (err) {
    next(err);
  }
};
