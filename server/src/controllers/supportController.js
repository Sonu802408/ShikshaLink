import { SupportTicket } from '../models/SupportTicket.js';
import { SavedTutor } from '../models/SavedTutor.js';
import { TutorProfile } from '../models/TutorProfile.js';
import { Booking } from '../models/Booking.js';
import { createNotification } from '../services/notificationService.js';

// Toggle Save Tutor (Parent)
export const toggleSaveTutor = async (req, res, next) => {
  try {
    const { tutorProfileId } = req.body;
    if (!tutorProfileId) {
      return res.status(400).json({ success: false, message: 'Tutor ID is required.' });
    }

    const existing = await SavedTutor.findOne({
      parentUser: req.user.id,
      tutorProfile: tutorProfileId
    });

    if (existing) {
      await existing.deleteOne();
      return res.json({
        success: true,
        isSaved: false,
        message: 'Tutor removed from saved list.'
      });
    } else {
      await SavedTutor.create({
        parentUser: req.user.id,
        tutorProfile: tutorProfileId
      });
      return res.json({
        success: true,
        isSaved: true,
        message: 'Tutor saved to your favorites!'
      });
    }
  } catch (err) {
    next(err);
  }
};

// Get Parent's Saved Tutors
export const getSavedTutors = async (req, res, next) => {
  try {
    const saved = await SavedTutor.find({ parentUser: req.user.id })
      .populate({
        path: 'tutorProfile',
        populate: { path: 'user', select: 'name avatar email phone' }
      })
      .sort({ createdAt: -1 });

    const tutors = saved.map(s => s.tutorProfile).filter(Boolean);

    res.json({
      success: true,
      tutors
    });
  } catch (err) {
    next(err);
  }
};

// Create Support Ticket / Complaint / Replacement Request
export const createSupportTicket = async (req, res, next) => {
  try {
    const { ticketType, subject, description, bookingId } = req.body;

    if (!subject || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both subject and description for your ticket.'
      });
    }

    const ticket = await SupportTicket.create({
      user: req.user.id,
      role: req.user.role,
      booking: bookingId || null,
      ticketType: ticketType || 'complaint',
      subject: subject.trim(),
      description: description.trim(),
      status: 'open'
    });

    res.status(201).json({
      success: true,
      message: 'Support ticket submitted. Our team will review and assist you promptly.',
      ticket
    });
  } catch (err) {
    next(err);
  }
};

// Get User's Tickets
export const getMyTickets = async (req, res, next) => {
  try {
    const tickets = await SupportTicket.find({ user: req.user.id })
      .populate('booking', 'subject classGrade schedule')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      tickets
    });
  } catch (err) {
    next(err);
  }
};
