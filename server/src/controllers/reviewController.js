import { Review } from '../models/Review.js';
import { Booking } from '../models/Booking.js';
import { TutorProfile } from '../models/TutorProfile.js';
import { BOOKING_STATUSES } from '../config/constants.js';
import { createNotification } from '../services/notificationService.js';

// Helper: Recalculate tutor ratings
const updateTutorAggregates = async (tutorProfileId) => {
  const reviews = await Review.find({
    tutorProfile: tutorProfileId,
    isPublished: true,
    moderationStatus: 'approved'
  });

  const count = reviews.length;
  if (count === 0) {
    await TutorProfile.findByIdAndUpdate(tutorProfileId, {
      averageRating: 0,
      reviewCount: 0,
      teachingQualityScore: 0,
      punctualityScore: 0,
      communicationScore: 0
    });
    return;
  }

  const avgOverall = reviews.reduce((sum, r) => sum + r.overallRating, 0) / count;
  const avgQuality = reviews.reduce((sum, r) => sum + r.teachingQualityRating, 0) / count;
  const avgPunctuality = reviews.reduce((sum, r) => sum + r.punctualityRating, 0) / count;
  const avgComm = reviews.reduce((sum, r) => sum + r.communicationRating, 0) / count;

  await TutorProfile.findByIdAndUpdate(tutorProfileId, {
    averageRating: Math.round(avgOverall * 10) / 10,
    reviewCount: count,
    teachingQualityScore: Math.round(avgQuality * 10) / 10,
    punctualityScore: Math.round(avgPunctuality * 10) / 10,
    communicationScore: Math.round(avgComm * 10) / 10
  });
};

// Create a Review for a completed booking
export const createReview = async (req, res, next) => {
  try {
    const {
      bookingId,
      overallRating,
      teachingQualityRating,
      punctualityRating,
      communicationRating,
      feedbackText
    } = req.body;

    if (!bookingId || !overallRating || !teachingQualityRating || !punctualityRating || !communicationRating || !feedbackText) {
      return res.status(400).json({
        success: false,
        message: 'All rating fields and feedback comment are required.'
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    // Ownership check
    if (booking.parentUser.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only review bookings for your own children.'
      });
    }

    // Eligibility check: Only completed or demo_completed bookings
    const isCompleted = [BOOKING_STATUSES.COMPLETED, BOOKING_STATUSES.DEMO_COMPLETED].includes(booking.status);
    if (!isCompleted) {
      return res.status(400).json({
        success: false,
        message: `Reviews can only be submitted after a session is completed (Current booking status: '${booking.status}').`
      });
    }

    // Check duplicate
    const existingReview = await Review.findOne({ booking: booking._id });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'A review has already been submitted for this completed booking.'
      });
    }

    const review = await Review.create({
      booking: booking._id,
      parentUser: req.user.id,
      tutorUser: booking.tutorUser,
      tutorProfile: booking.tutorProfile,
      child: booking.child,
      overallRating: Number(overallRating),
      teachingQualityRating: Number(teachingQualityRating),
      punctualityRating: Number(punctualityRating),
      communicationRating: Number(communicationRating),
      feedbackText: feedbackText.trim(),
      isPublished: true,
      moderationStatus: 'approved'
    });

    booking.hasReview = true;
    await booking.save();

    // Recalculate tutor's public rating
    await updateTutorAggregates(booking.tutorProfile);

    // Notify tutor of review
    createNotification({
      recipient: booking.tutorUser,
      sender: req.user.id,
      title: 'New Student Review Received!',
      message: `A parent left a ${overallRating}-star review for your tuition session.`,
      type: 'review',
      link: '/tutor/reviews'
    });

    res.status(201).json({
      success: true,
      message: 'Thank you! Your review has been published.',
      review
    });
  } catch (err) {
    next(err);
  }
};

// Tutor Reply to Review
export const replyToReview = async (req, res, next) => {
  try {
    const { replyText } = req.body;
    if (!replyText || !replyText.trim()) {
      return res.status(400).json({ success: false, message: 'Reply text cannot be empty.' });
    }

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    if (review.tutorUser.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Only the tutor can reply to this review.' });
    }

    review.tutorReply = {
      text: replyText.trim(),
      repliedAt: new Date()
    };

    await review.save();

    res.json({
      success: true,
      message: 'Response posted successfully.',
      review
    });
  } catch (err) {
    next(err);
  }
};

// Get reviews for current user (Parent or Tutor)
export const getMyReviews = async (req, res, next) => {
  try {
    const isParent = req.user.role === 'parent';
    const query = isParent ? { parentUser: req.user.id } : { tutorUser: req.user.id };

    const reviews = await Review.find(query)
      .populate('parentUser', 'name')
      .populate('tutorUser', 'name avatar')
      .populate('booking', 'subject classGrade teachingMode schedule')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      reviews
    });
  } catch (err) {
    next(err);
  }
};
