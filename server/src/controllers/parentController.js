import { ParentProfile } from '../models/ParentProfile.js';
import { ChildProfile } from '../models/ChildProfile.js';

// Get current parent profile
export const getMyParentProfile = async (req, res, next) => {
  try {
    let profile = await ParentProfile.findOne({ user: req.user.id });
    if (!profile) {
      profile = await ParentProfile.create({ user: req.user.id });
    }
    const children = await ChildProfile.find({ parentUser: req.user.id });

    res.json({
      success: true,
      profile,
      children
    });
  } catch (err) {
    next(err);
  }
};

// Update parent profile
export const updateParentProfile = async (req, res, next) => {
  try {
    const { city, locality, address, pincode, preferredLanguage, notificationPreferences } = req.body;

    let profile = await ParentProfile.findOne({ user: req.user.id });
    if (!profile) {
      profile = new ParentProfile({ user: req.user.id });
    }

    if (city !== undefined) profile.city = city;
    if (locality !== undefined) profile.locality = locality;
    if (address !== undefined) profile.address = address;
    if (pincode !== undefined) profile.pincode = pincode;
    if (preferredLanguage !== undefined) profile.preferredLanguage = preferredLanguage;
    if (notificationPreferences !== undefined) profile.notificationPreferences = notificationPreferences;

    await profile.save();

    res.json({
      success: true,
      message: 'Parent profile updated successfully.',
      profile
    });
  } catch (err) {
    next(err);
  }
};

// Add a child profile
export const createChild = async (req, res, next) => {
  try {
    const { fullName, classGrade, board, school, subjects, preferredLanguage, learningGoals, specialNeedsOrNotes } = req.body;

    if (!fullName || !classGrade || !board) {
      return res.status(400).json({
        success: false,
        message: 'Child full name, class/grade, and school board are required.'
      });
    }

    let parentProfile = await ParentProfile.findOne({ user: req.user.id });
    if (!parentProfile) {
      parentProfile = await ParentProfile.create({ user: req.user.id });
    }

    const child = await ChildProfile.create({
      parent: parentProfile._id,
      parentUser: req.user.id,
      fullName: fullName.trim(),
      classGrade: classGrade.trim(),
      board: board.trim(),
      school: school ? school.trim() : '',
      subjects: Array.isArray(subjects) ? subjects : [],
      preferredLanguage: preferredLanguage || 'English',
      learningGoals: learningGoals || '',
      specialNeedsOrNotes: specialNeedsOrNotes || ''
    });

    res.status(201).json({
      success: true,
      message: 'Child profile added successfully.',
      child
    });
  } catch (err) {
    next(err);
  }
};

// Get all children for parent
export const getMyChildren = async (req, res, next) => {
  try {
    const children = await ChildProfile.find({ parentUser: req.user.id }).sort({ createdAt: -1 });
    res.json({
      success: true,
      children
    });
  } catch (err) {
    next(err);
  }
};

// Get single child (ensuring ownership)
export const getChildById = async (req, res, next) => {
  try {
    const child = await ChildProfile.findById(req.params.id);
    if (!child) {
      return res.status(404).json({ success: false, message: 'Child profile not found.' });
    }

    // Ownership check: Parent can see their child, Admin can see, or Booked Tutor can see safe details
    if (child.parentUser.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized access to child profile.' });
    }

    res.json({
      success: true,
      child
    });
  } catch (err) {
    next(err);
  }
};

// Update child profile
export const updateChild = async (req, res, next) => {
  try {
    const child = await ChildProfile.findById(req.params.id);
    if (!child) {
      return res.status(404).json({ success: false, message: 'Child profile not found.' });
    }

    if (child.parentUser.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to modify this child profile.' });
    }

    const { fullName, classGrade, board, school, subjects, preferredLanguage, learningGoals, specialNeedsOrNotes } = req.body;

    if (fullName) child.fullName = fullName.trim();
    if (classGrade) child.classGrade = classGrade.trim();
    if (board) child.board = board.trim();
    if (school !== undefined) child.school = school.trim();
    if (subjects !== undefined) child.subjects = subjects;
    if (preferredLanguage) child.preferredLanguage = preferredLanguage;
    if (learningGoals !== undefined) child.learningGoals = learningGoals;
    if (specialNeedsOrNotes !== undefined) child.specialNeedsOrNotes = specialNeedsOrNotes;

    await child.save();

    res.json({
      success: true,
      message: 'Child profile updated.',
      child
    });
  } catch (err) {
    next(err);
  }
};

// Delete child profile
export const deleteChild = async (req, res, next) => {
  try {
    const child = await ChildProfile.findById(req.params.id);
    if (!child) {
      return res.status(404).json({ success: false, message: 'Child profile not found.' });
    }

    if (child.parentUser.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this child profile.' });
    }

    await child.deleteOne();

    res.json({
      success: true,
      message: 'Child profile removed.'
    });
  } catch (err) {
    next(err);
  }
};
