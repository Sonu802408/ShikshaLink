import { ParentProfile } from '../models/ParentProfile.js';
import { ChildProfile } from '../models/ChildProfile.js';
import { User } from '../models/User.js';
import { Booking } from '../models/Booking.js';
import { SavedTutor } from '../models/SavedTutor.js';
import { TutorProfile } from '../models/TutorProfile.js';

// Get current parent profile with auto-population from user account
export const getMyParentProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('name email phone role avatar');
    let profile = await ParentProfile.findOne({ user: req.user.id });

    if (!profile) {
      profile = await ParentProfile.create({
        user: req.user.id,
        fullName: user?.name || '',
        phone: user?.phone || '',
        avatar: user?.avatar || '',
        city: 'Delhi',
        locality: 'Mayur Vihar Phase 1'
      });
    } else {
      // Auto-populate missing parent details from user account
      let shouldSave = false;
      if (!profile.fullName && user?.name) {
        profile.fullName = user.name;
        shouldSave = true;
      }
      if (!profile.phone && user?.phone) {
        profile.phone = user.phone;
        shouldSave = true;
      }
      if (!profile.avatar && user?.avatar) {
        profile.avatar = user.avatar;
        shouldSave = true;
      }
      if (shouldSave) {
        await profile.save();
      }
    }

    const children = await ChildProfile.find({ parentUser: req.user.id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      profile,
      user: {
        _id: user?._id,
        name: profile.fullName || user?.name || '',
        email: user?.email || '',
        phone: profile.phone || user?.phone || '',
        avatar: profile.avatar || user?.avatar || '',
        role: user?.role
      },
      children,
      childrenCount: children.length
    });
  } catch (err) {
    next(err);
  }
};

// Update parent profile
export const updateParentProfile = async (req, res, next) => {
  try {
    const {
      fullName,
      phone,
      whatsappNumber,
      city,
      locality,
      address,
      pincode,
      avatar,
      preferredLanguage,
      notificationPreferences
    } = req.body;

    let profile = await ParentProfile.findOne({ user: req.user.id });
    if (!profile) {
      profile = new ParentProfile({ user: req.user.id });
    }

    if (fullName !== undefined) profile.fullName = fullName.trim();
    if (phone !== undefined) profile.phone = phone.trim();
    if (whatsappNumber !== undefined) profile.whatsappNumber = whatsappNumber.trim();
    if (city !== undefined) profile.city = city.trim();
    if (locality !== undefined) profile.locality = locality.trim();
    if (address !== undefined) profile.address = address.trim();
    if (pincode !== undefined) profile.pincode = pincode.trim();
    if (avatar !== undefined) profile.avatar = avatar.trim();
    if (preferredLanguage !== undefined) profile.preferredLanguage = preferredLanguage;
    if (notificationPreferences !== undefined) profile.notificationPreferences = notificationPreferences;

    await profile.save();

    // Sync basic info back to User record as well
    const userUpdates = {};
    if (fullName && fullName.trim()) userUpdates.name = fullName.trim();
    if (phone && phone.trim()) userUpdates.phone = phone.trim();
    if (avatar && avatar.trim()) userUpdates.avatar = avatar.trim();

    if (Object.keys(userUpdates).length > 0) {
      await User.findByIdAndUpdate(req.user.id, userUpdates);
    }

    res.json({
      success: true,
      message: 'Parent profile updated successfully.',
      profile
    });
  } catch (err) {
    next(err);
  }
};

// Upload parent avatar
export const uploadParentAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select an image file to upload.' });
    }
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    await ParentProfile.findOneAndUpdate({ user: req.user.id }, { avatar: avatarUrl }, { upsert: true });
    await User.findByIdAndUpdate(req.user.id, { avatar: avatarUrl });
    res.json({
      success: true,
      message: 'Profile photo uploaded successfully!',
      avatarUrl
    });
  } catch (err) {
    next(err);
  }
};

// Add a child profile
export const createChild = async (req, res, next) => {
  try {
    const {
      fullName,
      classGrade,
      board,
      medium,
      school,
      subjects,
      preferredLanguage,
      learningGoals,
      specialNeedsOrNotes
    } = req.body;

    if (!fullName || !classGrade || !board) {
      return res.status(400).json({
        success: false,
        message: 'Student full name, class/grade, and school board are required.'
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
      medium: (medium || preferredLanguage || 'English').trim(),
      school: school ? school.trim() : '',
      subjects: Array.isArray(subjects) ? subjects : [],
      preferredLanguage: preferredLanguage || medium || 'English',
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

    const {
      fullName,
      classGrade,
      board,
      medium,
      school,
      subjects,
      preferredLanguage,
      learningGoals,
      specialNeedsOrNotes
    } = req.body;

    if (fullName) child.fullName = fullName.trim();
    if (classGrade) child.classGrade = classGrade.trim();
    if (board) child.board = board.trim();
    if (medium) child.medium = medium.trim();
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

// Delete child profile (with active booking dependency check)
export const deleteChild = async (req, res, next) => {
  try {
    const child = await ChildProfile.findById(req.params.id);
    if (!child) {
      return res.status(404).json({ success: false, message: 'Child profile not found.' });
    }

    if (child.parentUser.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this child profile.' });
    }

    // Check if child has active booking dependencies
    const activeBooking = await Booking.findOne({
      child: req.params.id,
      status: { $in: ['pending', 'accepted', 'confirmed', 'alternative_proposed'] }
    });

    if (activeBooking) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove this child profile because there is an active session booking or request associated with it.'
      });
    }

    await child.deleteOne();

    res.json({
      success: true,
      message: 'Child profile removed successfully.'
    });
  } catch (err) {
    next(err);
  }
};

// Get Parent's Tutor Cart & Suggested Tutors
export const getParentCart = async (req, res, next) => {
  try {
    const saved = await SavedTutor.find({ parentUser: req.user.id })
      .populate({
        path: 'tutorProfile',
        populate: { path: 'user', select: 'name avatar email phone' }
      })
      .sort({ createdAt: -1 });

    const tutors = saved.map((s) => s.tutorProfile).filter(Boolean);

    // If cart has few tutors, also fetch top verified active tutors to recommend for instant booking
    let recommendedTutors = [];
    const savedIds = tutors.map((t) => t._id);
    recommendedTutors = await TutorProfile.find({
      _id: { $nin: savedIds },
      isPublished: true,
      isAcceptingStudents: true,
      applicationStatus: 'approved'
    })
      .populate('user', 'name avatar email phone')
      .sort({ averageRating: -1, reviewCount: -1 })
      .limit(6);

    res.json({
      success: true,
      tutors,
      recommendedTutors
    });
  } catch (err) {
    next(err);
  }
};

// Toggle or remove tutor from Parent's cart
export const toggleCartTutor = async (req, res, next) => {
  try {
    const { tutorProfileId } = req.body;
    if (!tutorProfileId) {
      return res.status(400).json({ success: false, message: 'Tutor profile ID is required.' });
    }

    const existing = await SavedTutor.findOne({
      parentUser: req.user.id,
      tutorProfile: tutorProfileId
    });

    if (existing) {
      await existing.deleteOne();
      return res.json({
        success: true,
        inCart: false,
        message: 'Tutor removed from your cart.'
      });
    } else {
      await SavedTutor.create({
        parentUser: req.user.id,
        tutorProfile: tutorProfileId
      });
      return res.json({
        success: true,
        inCart: true,
        message: 'Tutor added to your cart!'
      });
    }
  } catch (err) {
    next(err);
  }
};
