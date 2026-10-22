import { TuitionRequirement } from '../models/TuitionRequirement.js';
import { ParentProfile } from '../models/ParentProfile.js';
import { ChildProfile } from '../models/ChildProfile.js';
import { TutorProfile } from '../models/TutorProfile.js';
import { findMatchingTutors } from '../services/matchingService.js';
import { createNotification } from '../services/notificationService.js';
import { REQUIREMENT_STATUSES } from '../config/constants.js';

// Create tuition requirement (Multi-step form submission)
export const createRequirement = async (req, res, next) => {
  try {
    const {
      childId,
      classGrade,
      board,
      subjects,
      preferredLanguage,
      learningGoals,
      teachingMode,
      schedule,
      budget,
      location,
      tutorPreferences
    } = req.body;

    if (!childId || !classGrade || !board || !subjects || !subjects.length || !teachingMode) {
      return res.status(400).json({
        success: false,
        message: 'Please complete all required fields: Child, Class, Board, Subjects, and Teaching Mode.'
      });
    }

    // Verify child belongs to parent
    const child = await ChildProfile.findById(childId);
    if (!child || child.parentUser.toString() !== req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Invalid child profile selected.'
      });
    }

    const parentProfile = await ParentProfile.findOne({ user: req.user.id });

    const requirement = await TuitionRequirement.create({
      parent: parentProfile._id,
      parentUser: req.user.id,
      child: child._id,
      title: `${subjects.join(', ')} tuition for ${child.displayName || child.fullName} (${classGrade}, ${board})`,
      classGrade,
      board,
      subjects,
      preferredLanguage: preferredLanguage || 'English & Hindi',
      learningGoals: learningGoals || child.learningGoals,
      teachingMode,
      schedule: schedule || {},
      budget: budget || {},
      location: location || { locality: parentProfile.locality, city: parentProfile.city },
      tutorPreferences: tutorPreferences || {},
      status: REQUIREMENT_STATUSES.ACTIVE
    });

    // Notify matching tutors in background
    const matched = await findMatchingTutors(requirement);
    if (matched && matched.length > 0) {
      // Notify top 3 tutors of new opportunity
      matched.slice(0, 3).forEach(m => {
        createNotification({
          recipient: m.tutor.user._id,
          title: 'New Matching Tuition Requirement!',
          message: `A parent in ${requirement.location.locality} needs a tutor for ${classGrade} ${subjects.join(', ')} (${teachingMode.replace('_', ' ')}).`,
          type: 'requirement_match',
          link: `/tutor/requirements`
        });
      });
    }

    res.status(201).json({
      success: true,
      message: 'Tuition requirement posted successfully. Matching tutors have been identified.',
      requirement,
      matchedCount: matched.length
    });
  } catch (err) {
    next(err);
  }
};

// Get parent's requirements
export const getMyRequirements = async (req, res, next) => {
  try {
    const requirements = await TuitionRequirement.find({ parentUser: req.user.id })
      .populate('child', 'displayName fullName classGrade board')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      requirements
    });
  } catch (err) {
    next(err);
  }
};

// Get single requirement with matching tutors
export const getRequirementById = async (req, res, next) => {
  try {
    const requirement = await TuitionRequirement.findById(req.params.id)
      .populate('child', 'displayName classGrade board subjects preferredLanguage learningGoals')
      .populate('parentUser', 'name email phone');

    if (!requirement) {
      return res.status(404).json({ success: false, message: 'Tuition requirement not found.' });
    }

    // Authorization: parent owner, admin, or tutor viewing open requirements
    const isOwner = requirement.parentUser._id.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    const isTutor = req.user.role === 'tutor';

    if (!isOwner && !isAdmin && !isTutor) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this requirement.' });
    }

    // Compute matches
    const matches = await findMatchingTutors(requirement);

    res.json({
      success: true,
      requirement,
      matches: isOwner || isAdmin ? matches : [] // Only parent or admin see full matched list
    });
  } catch (err) {
    next(err);
  }
};

// Update requirement status (pause, close, activate)
export const updateRequirementStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const requirement = await TuitionRequirement.findById(req.params.id);

    if (!requirement) {
      return res.status(404).json({ success: false, message: 'Requirement not found.' });
    }

    if (requirement.parentUser.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    if (!Object.values(REQUIREMENT_STATUSES).includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    requirement.status = status;
    await requirement.save();

    res.json({
      success: true,
      message: `Requirement status updated to ${status}.`,
      requirement
    });
  } catch (err) {
    next(err);
  }
};

// Tutors feed: discover active requirements
export const getTutorRequirementsFeed = async (req, res, next) => {
  try {
    const tutorProfile = await TutorProfile.findOne({ user: req.user.id });
    if (!tutorProfile) {
      return res.status(404).json({ success: false, message: 'Tutor profile not found.' });
    }

    // Find active requirements matching tutor's subjects or classes
    const query = {
      status: REQUIREMENT_STATUSES.ACTIVE,
      teachingMode: { $in: tutorProfile.teachingModes }
    };

    if (tutorProfile.subjects && tutorProfile.subjects.length > 0) {
      query.subjects = { $in: tutorProfile.subjects };
    }

    const requirements = await TuitionRequirement.find(query)
      .populate('child', 'displayName classGrade board')
      .sort({ createdAt: -1 })
      .limit(30);

    // Safeguard: Ensure child full names or phone numbers are never exposed in feed
    const safeFeed = requirements.map(reqItem => {
      const item = reqItem.toObject();
      return {
        _id: item._id,
        title: item.title,
        classGrade: item.classGrade,
        board: item.board,
        subjects: item.subjects,
        teachingMode: item.teachingMode,
        schedule: item.schedule,
        budget: item.budget,
        location: {
          city: item.location?.city,
          locality: item.location?.locality
        },
        childSummary: {
          displayName: item.child?.displayName || 'Student',
          classGrade: item.child?.classGrade
        },
        createdAt: item.createdAt
      };
    });

    res.json({
      success: true,
      feed: safeFeed
    });
  } catch (err) {
    next(err);
  }
};
