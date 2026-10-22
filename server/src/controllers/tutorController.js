import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { TutorProfile } from '../models/TutorProfile.js';
import { TutorQualification } from '../models/TutorQualification.js';
import { Review } from '../models/Review.js';
import { User } from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Search & Filter Tutors (Public endpoint)
export const getPublicTutors = async (req, res, next) => {
  try {
    const {
      subject,
      classGrade,
      teachingMode,
      locality,
      minFee,
      maxFee,
      minExp,
      verifiedOnly,
      demoAvailable,
      sortBy = 'best_match',
      page = 1,
      limit = 12
    } = req.query;

    const query = {
      isPublished: true,
      isAcceptingStudents: true
    };

    if (subject) {
      query.subjects = { $regex: new RegExp(`^${subject.trim()}$`, 'i') };
    }

    if (classGrade) {
      query.classes = { $in: [classGrade.trim()] };
    }

    if (teachingMode) {
      query.teachingModes = teachingMode.trim();
    }

    if (locality) {
      const locRegex = new RegExp(locality.trim(), 'i');
      query.$or = [
        { primaryLocality: locRegex },
        { 'homeTuitionDetails.preferredLocalities': locRegex },
        { 'centreDetails.locality': locRegex }
      ];
    }

    if (minFee || maxFee) {
      query['feeStructure.hourlyRate'] = {};
      if (minFee) query['feeStructure.hourlyRate'].$gte = Number(minFee);
      if (maxFee) query['feeStructure.hourlyRate'].$lte = Number(maxFee);
    }

    if (minExp) {
      query.yearsOfExperience = { $gte: Number(minExp) };
    }

    if (verifiedOnly === 'true') {
      query['verificationBadges.qualificationVerified'] = true;
    }

    if (demoAvailable === 'true') {
      query.demoClassAvailable = true;
    }

    // Sorting
    let sort = {};
    if (sortBy === 'lowest_fee') {
      sort = { 'feeStructure.hourlyRate': 1 };
    } else if (sortBy === 'highest_experience') {
      sort = { yearsOfExperience: -1 };
    } else if (sortBy === 'highest_rating') {
      sort = { averageRating: -1, reviewCount: -1 };
    } else {
      // Default: best match (rating + verified + experience)
      sort = { 'verificationBadges.qualificationVerified': -1, averageRating: -1, yearsOfExperience: -1 };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const totalTutors = await TutorProfile.countDocuments(query);

    const tutors = await TutorProfile.find(query)
      .populate('user', 'name avatar email phone')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    // Map tutors to safely exclude centre full address if any
    const safeTutors = tutors.map(t => {
      const tObj = t.toObject();
      if (tObj.centreDetails && tObj.centreDetails.fullAddress) {
        // Redact exact centre address from public discovery
        tObj.centreDetails.fullAddress = '[Revealed upon confirmed booking]';
      }
      return tObj;
    });

    res.json({
      success: true,
      total: totalTutors,
      page: Number(page),
      totalPages: Math.ceil(totalTutors / Number(limit)),
      tutors: safeTutors
    });
  } catch (err) {
    next(err);
  }
};

// Get single tutor public profile
export const getPublicTutorById = async (req, res, next) => {
  try {
    const tutor = await TutorProfile.findById(req.params.id)
      .populate('user', 'name avatar isEmailVerified isPhoneVerified createdAt');

    if (!tutor || !tutor.isPublished) {
      return res.status(404).json({ success: false, message: 'Tutor profile not found.' });
    }

    // Fetch verified qualifications
    const qualifications = await TutorQualification.find({
      tutor: tutor._id,
      verificationStatus: 'verified'
    }).select('degree institution fieldOfStudy passingYear verificationStatus');

    // Fetch approved reviews
    const reviews = await Review.find({
      tutorProfile: tutor._id,
      isPublished: true,
      moderationStatus: 'approved'
    })
      .populate('parentUser', 'name')
      .sort({ createdAt: -1 });

    const tutorObj = tutor.toObject();

    // Redact private centre address unless the current viewer is authorized
    if (tutorObj.centreDetails && tutorObj.centreDetails.fullAddress) {
      tutorObj.centreDetails.fullAddress = '[Revealed upon confirmed booking]';
    }

    res.json({
      success: true,
      tutor: tutorObj,
      qualifications,
      reviews
    });
  } catch (err) {
    next(err);
  }
};

// Get current tutor profile (logged in)
export const getMyTutorProfile = async (req, res, next) => {
  try {
    let profile = await TutorProfile.findOne({ user: req.user.id }).populate('user', 'name email phone avatar isEmailVerified isPhoneVerified');
    if (!profile) {
      profile = await TutorProfile.create({
        user: req.user.id,
        headline: `${req.user.name} - Academic Tutor`
      });
    }

    const qualifications = await TutorQualification.find({ tutor: profile._id });

    // Calculate profile completion percentage
    let completedSteps = 0;
    const totalSteps = 6;
    if (profile.bio && profile.bio.length > 20) completedSteps++;
    if (profile.subjects && profile.subjects.length > 0) completedSteps++;
    if (profile.classes && profile.classes.length > 0) completedSteps++;
    if (profile.teachingModes && profile.teachingModes.length > 0) completedSteps++;
    if (profile.feeStructure?.hourlyRate > 0) completedSteps++;
    if (qualifications.length > 0) completedSteps++;

    const profileCompletion = Math.round((completedSteps / totalSteps) * 100);

    res.json({
      success: true,
      profile,
      qualifications,
      profileCompletion
    });
  } catch (err) {
    next(err);
  }
};

// Update current tutor profile
export const updateMyTutorProfile = async (req, res, next) => {
  try {
    let profile = await TutorProfile.findOne({ user: req.user.id });
    if (!profile) {
      profile = new TutorProfile({ user: req.user.id });
    }

    const {
      headline,
      bio,
      teachingModes,
      subjects,
      classes,
      boards,
      yearsOfExperience,
      previousExperience,
      teachingLanguages,
      teachingMethodology,
      specialSkills,
      demoClassAvailable,
      demoClassFee,
      feeStructure,
      homeTuitionDetails,
      centreDetails,
      city,
      primaryLocality,
      isAcceptingStudents,
      isPublished
    } = req.body;

    if (headline !== undefined) profile.headline = headline.trim();
    if (bio !== undefined) profile.bio = bio.trim();
    if (teachingModes !== undefined) profile.teachingModes = teachingModes;
    if (subjects !== undefined) profile.subjects = subjects;
    if (classes !== undefined) profile.classes = classes;
    if (boards !== undefined) profile.boards = boards;
    if (yearsOfExperience !== undefined) profile.yearsOfExperience = Number(yearsOfExperience);
    if (previousExperience !== undefined) profile.previousExperience = previousExperience;
    if (teachingLanguages !== undefined) profile.teachingLanguages = teachingLanguages;
    if (teachingMethodology !== undefined) profile.teachingMethodology = teachingMethodology;
    if (specialSkills !== undefined) profile.specialSkills = specialSkills;
    if (demoClassAvailable !== undefined) profile.demoClassAvailable = Boolean(demoClassAvailable);
    if (demoClassFee !== undefined) profile.demoClassFee = Number(demoClassFee);
    if (feeStructure !== undefined) profile.feeStructure = { ...profile.feeStructure, ...feeStructure };
    if (homeTuitionDetails !== undefined) profile.homeTuitionDetails = { ...profile.homeTuitionDetails, ...homeTuitionDetails };
    if (centreDetails !== undefined) profile.centreDetails = { ...profile.centreDetails, ...centreDetails };
    if (city !== undefined) profile.city = city;
    if (primaryLocality !== undefined) profile.primaryLocality = primaryLocality;
    if (isAcceptingStudents !== undefined) profile.isAcceptingStudents = isAcceptingStudents;
    if (isPublished !== undefined) profile.isPublished = isPublished;

    await profile.save();

    res.json({
      success: true,
      message: 'Tutor profile updated successfully.',
      profile
    });
  } catch (err) {
    next(err);
  }
};

// Update availability matrix
export const updateAvailability = async (req, res, next) => {
  try {
    const { availability } = req.body;
    let profile = await TutorProfile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Tutor profile not found.' });
    }

    if (!Array.isArray(availability)) {
      return res.status(400).json({ success: false, message: 'Availability must be an array of days.' });
    }

    profile.availability = availability;
    await profile.save();

    res.json({
      success: true,
      message: 'Availability schedule saved.',
      availability: profile.availability
    });
  } catch (err) {
    next(err);
  }
};

// Upload qualification document
export const uploadQualification = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a qualification certificate document (PDF, JPEG, or PNG).'
      });
    }

    const { degree, institution, fieldOfStudy, passingYear } = req.body;
    if (!degree || !institution || !passingYear) {
      return res.status(400).json({
        success: false,
        message: 'Degree title, institution, and passing year are required.'
      });
    }

    const tutorProfile = await TutorProfile.findOne({ user: req.user.id });
    if (!tutorProfile) {
      return res.status(404).json({ success: false, message: 'Tutor profile not found.' });
    }

    const qualification = await TutorQualification.create({
      tutor: tutorProfile._id,
      tutorUser: req.user.id,
      degree: degree.trim(),
      institution: institution.trim(),
      fieldOfStudy: fieldOfStudy ? fieldOfStudy.trim() : '',
      passingYear: Number(passingYear),
      documentPath: req.file.filename,
      documentOriginalName: req.file.originalname,
      documentMimeType: req.file.mimetype,
      verificationStatus: 'pending' // Admin must review
    });

    res.status(201).json({
      success: true,
      message: 'Qualification document submitted for verification.',
      qualification
    });
  } catch (err) {
    next(err);
  }
};

// Delete qualification
export const deleteQualification = async (req, res, next) => {
  try {
    const qualification = await TutorQualification.findById(req.params.id);
    if (!qualification) {
      return res.status(404).json({ success: false, message: 'Qualification not found.' });
    }

    if (qualification.tutorUser.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to remove this document.' });
    }

    // Try deleting physical private file
    const filePath = path.join(__dirname, '../../uploads/private', qualification.documentPath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await qualification.deleteOne();

    res.json({
      success: true,
      message: 'Qualification record deleted.'
    });
  } catch (err) {
    next(err);
  }
};

// Securely view or download private qualification document
export const getSecureDocument = async (req, res, next) => {
  try {
    const qualification = await TutorQualification.findById(req.params.id);
    if (!qualification) {
      return res.status(404).json({ success: false, message: 'Document record not found.' });
    }

    // Strict access control: only the owner tutor or an administrator can access private documents
    if (qualification.tutorUser.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to view this confidential qualification document.'
      });
    }

    const filePath = path.join(__dirname, '../../uploads/private', qualification.documentPath);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File not found on server.' });
    }

    res.setHeader('Content-Type', qualification.documentMimeType || 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${qualification.documentOriginalName || 'document.pdf'}"`);
    res.sendFile(filePath);
  } catch (err) {
    next(err);
  }
};
