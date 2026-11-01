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
      profileStatus: { $ne: 'draft' },
      applicationStatus: { $nin: ['draft', 'withdrawn', 'inactive', 'rejected'] },
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

    // Sorting: pinned tutors always appear first
    let sort = { isPinned: -1 };
    if (sortBy === 'lowest_fee') {
      sort['feeStructure.hourlyRate'] = 1;
    } else if (sortBy === 'highest_experience') {
      sort.yearsOfExperience = -1;
    } else if (sortBy === 'highest_rating') {
      sort.averageRating = -1;
      sort.reviewCount = -1;
    } else {
      // Default: best match (pinned + rating + verified + experience)
      sort['verificationBadges.qualificationVerified'] = -1;
      sort.averageRating = -1;
      sort.yearsOfExperience = -1;
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
      // Never expose private contact and address details publicly
      delete tObj.fullAddressPrivate;
      delete tObj.whatsappNumber;
      delete tObj.verificationDocuments;
      if (tObj.user) {
        delete tObj.user.phone;
        delete tObj.user.email;
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

    if (!tutor || !tutor.isPublished || (tutor.profileStatus && tutor.profileStatus === 'draft')) {
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
    delete tutorObj.fullAddressPrivate;
    delete tutorObj.whatsappNumber;
    delete tutorObj.verificationDocuments;

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

// Profile completion calculation helper
export const calculateProfileCompletion = (profile, qualifications = []) => {
  if (!profile) return 0;
  let score = 0;
  const total = 8;
  // Step 1: Personal (fullName or user.name, and area/city/phone)
  if ((profile.fullName || profile.user?.name) && (profile.area || profile.primaryLocality || profile.city)) score++;
  // Step 2: Education (highestQualification or degreeCourseName or qualificationsList or qualifications)
  if (profile.highestQualification || profile.degreeCourseName || (profile.qualificationsList && profile.qualificationsList.length > 0) || qualifications.length > 0) score++;
  // Step 3: Experience (experienceYears > 0 or yearsOfExperience > 0 or experienceDescription or previousExperience)
  if (profile.experienceYears > 0 || profile.yearsOfExperience > 0 || profile.experienceDescription || profile.previousExperience) score++;
  // Step 4: Classes & Subjects (classes or subjects)
  if ((profile.subjects && profile.subjects.length > 0) || (profile.schoolClassGroups && profile.schoolClassGroups.length > 0) || (profile.customSubjects && profile.customSubjects.length > 0)) score++;
  // Step 5: Teaching Preferences (teachingModes or teachingModePreferences)
  if ((profile.teachingModes && profile.teachingModes.length > 0) || (profile.teachingModePreferences && profile.teachingModePreferences.length > 0)) score++;
  // Step 6: Fees (hourlyFee > 0 or hourlyRate > 0)
  if ((profile.hourlyFee && profile.hourlyFee > 0) || (profile.feeStructure?.hourlyRate && profile.feeStructure.hourlyRate > 0)) score++;
  // Step 7: About the Tutor (headline and bio)
  if (profile.headline && profile.bio && profile.bio.length >= 20) score++;
  // Step 8: Documents (verificationDocuments or qualifications with document)
  if ((profile.verificationDocuments && profile.verificationDocuments.length > 0) || qualifications.length > 0) score++;

  return Math.min(100, Math.round((score / total) * 100));
};

// Get current tutor profile (logged in)
export const getMyTutorProfile = async (req, res, next) => {
  try {
    let profile = await TutorProfile.findOne({ user: req.user.id }).populate('user', 'name email phone avatar isEmailVerified isPhoneVerified role');
    if (!profile) {
      profile = await TutorProfile.create({
        user: req.user.id,
        fullName: req.user.name || '',
        headline: `${req.user.name || 'Academic'} - Academic Tutor`,
        profileStatus: 'draft',
        registrationStep: 1
      });
    }

    const qualifications = await TutorQualification.find({ tutor: profile._id });
    const profileCompletion = calculateProfileCompletion(profile, qualifications);

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

// Get Tutor Application Cart for current user
export const getTutorCart = async (req, res, next) => {
  try {
    const profile = await TutorProfile.findOne({ user: req.user.id })
      .populate('user', 'name email phone avatar role status createdAt');

    if (!profile) {
      return res.json({
        success: true,
        hasApplication: false,
        application: null,
        isInCart: false
      });
    }

    const qualifications = await TutorQualification.find({ tutor: profile._id });
    const profileCompletion = calculateProfileCompletion(profile, qualifications);

    res.json({
      success: true,
      hasApplication: true,
      application: profile,
      isInCart: profile.isInCart !== false && profile.applicationStatus !== 'withdrawn' && profile.applicationStatus !== 'inactive',
      profileCompletion
    });
  } catch (err) {
    next(err);
  }
};

// Tutor Exits / Withdraws Application
export const withdrawTutorApplication = async (req, res, next) => {
  try {
    const profile = await TutorProfile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Tutor application not found.' });
    }

    const { reason = 'Voluntarily exited application' } = req.body;

    profile.applicationStatus = 'withdrawn';
    profile.profileStatus = 'draft';
    profile.isInCart = false;
    profile.isPublished = false;
    profile.isAcceptingStudents = false;
    profile.withdrawnAt = new Date();
    profile.withdrawnReason = reason;

    profile.statusHistory.push({
      status: 'withdrawn',
      changedBy: req.user.id,
      reason
    });

    await profile.save();

    res.json({
      success: true,
      message: 'Your tutor application has been withdrawn and your listing removed from public search. Your profile data and qualifications are safely preserved, and you can return anytime.',
      profile
    });
  } catch (err) {
    next(err);
  }
};

// Tutor Reactivates Saved Application
export const reactivateTutorApplication = async (req, res, next) => {
  try {
    const profile = await TutorProfile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Tutor application not found.' });
    }

    profile.applicationStatus = profile.termsAccepted ? 'applied' : 'draft';
    profile.isInCart = true;
    profile.withdrawnAt = null;
    profile.withdrawnReason = '';

    profile.statusHistory.push({
      status: profile.applicationStatus,
      changedBy: req.user.id,
      reason: 'Application reactivated by tutor'
    });

    await profile.save();

    res.json({
      success: true,
      message: 'Your tutor application has been restored and added back to your active Tutor Cart.',
      profile
    });
  } catch (err) {
    next(err);
  }
};

// Save Tutor Registration Draft (Cross-Device Autosave / Manual Save)
export const saveTutorDraft = async (req, res, next) => {
  try {
    let profile = await TutorProfile.findOne({ user: req.user.id });
    if (!profile) {
      profile = new TutorProfile({ user: req.user.id, profileStatus: 'draft' });
    }

    const data = req.body;

    const draftFields = [
      'registrationStep',
      'fullName',
      'dateOfBirth',
      'gender',
      'whatsappNumber',
      'pincode',
      'area',
      'city',
      'primaryLocality',
      'fullAddressPrivate',
      'highestQualification',
      'degreeCourseName',
      'collegeUniversity',
      'passingYear',
      'expectedGraduationYear',
      'additionalCertifications',
      'qualificationsList',
      'experienceYears',
      'experienceMonths',
      'teachingInstitutions',
      'classesPreviouslyTaught',
      'subjectsPreviouslyTaught',
      'experienceDescription',
      'schoolClassGroups',
      'customSubjects',
      'additionalTeachingCategories',
      'subjects',
      'classes',
      'teachingModePreferences',
      'teachingModes',
      'preferredStudentLevels',
      'preferredTeachingAreas',
      'maxTravelDistanceKm',
      'availableDays',
      'availableTimeSlots',
      'preferredBatchSize',
      'onlineOfflinePreference',
      'teachingLanguages',
      'hourlyFee',
      'monthlyFee',
      'trialClassAvailable',
      'trialClassFee',
      'weeklyAvailability',
      'preferredPaymentMethods',
      'headline',
      'bio',
      'teachingMethodology',
      'strengthsAndSpecializations',
      'achievements',
      'awardsCertifications',
      'termsAccepted'
    ];

    draftFields.forEach((field) => {
      if (data[field] !== undefined) {
        profile[field] = data[field];
      }
    });

    // Synchronize fee structure
    if (data.hourlyFee !== undefined) {
      profile.feeStructure = profile.feeStructure || {};
      profile.feeStructure.hourlyRate = Number(data.hourlyFee) || 0;
    }
    if (data.monthlyFee !== undefined) {
      profile.feeStructure = profile.feeStructure || {};
      profile.feeStructure.monthlyRate = Number(data.monthlyFee) || 0;
    }
    if (data.experienceYears !== undefined || data.experienceMonths !== undefined) {
      const yrs = Number(profile.experienceYears) || 0;
      const mos = Number(profile.experienceMonths) || 0;
      profile.yearsOfExperience = yrs + (mos >= 6 ? 1 : 0);
    }
    if (data.area) {
      profile.primaryLocality = data.area;
    }

    // Keep draft status unless already published
    if (!profile.profileStatus || profile.profileStatus === 'draft') {
      profile.profileStatus = 'draft';
      profile.isPublished = false;
    }

    // Update user display name if provided
    if (data.fullName && data.fullName.trim()) {
      await User.findByIdAndUpdate(req.user.id, { name: data.fullName.trim() });
    }

    await profile.save();

    const qualifications = await TutorQualification.find({ tutor: profile._id });
    const completion = calculateProfileCompletion(profile, qualifications);

    const updatedProfile = await TutorProfile.findById(profile._id).populate('user', 'name email phone avatar role');

    res.json({
      success: true,
      message: 'Draft saved successfully.',
      profile: updatedProfile,
      profileCompletion: completion
    });
  } catch (err) {
    next(err);
  }
};

// Complete and Submit Tutor Profile
export const submitTutorProfile = async (req, res, next) => {
  try {
    let profile = await TutorProfile.findOne({ user: req.user.id });
    if (!profile) {
      profile = new TutorProfile({ user: req.user.id });
    }

    const data = req.body;

    const updateFields = [
      'fullName', 'dateOfBirth', 'gender', 'whatsappNumber', 'pincode', 'area', 'city', 'primaryLocality',
      'fullAddressPrivate', 'highestQualification', 'degreeCourseName', 'collegeUniversity', 'passingYear',
      'expectedGraduationYear', 'additionalCertifications', 'qualificationsList', 'experienceYears', 'experienceMonths',
      'teachingInstitutions', 'classesPreviouslyTaught', 'subjectsPreviouslyTaught', 'experienceDescription',
      'schoolClassGroups', 'customSubjects', 'additionalTeachingCategories', 'subjects', 'classes',
      'teachingModePreferences', 'teachingModes', 'preferredStudentLevels', 'preferredTeachingAreas',
      'maxTravelDistanceKm', 'availableDays', 'availableTimeSlots', 'preferredBatchSize', 'onlineOfflinePreference',
      'teachingLanguages', 'hourlyFee', 'monthlyFee', 'trialClassAvailable', 'trialClassFee', 'weeklyAvailability',
      'preferredPaymentMethods', 'headline', 'bio', 'teachingMethodology', 'strengthsAndSpecializations',
      'achievements', 'awardsCertifications', 'termsAccepted'
    ];

    updateFields.forEach((f) => {
      if (data[f] !== undefined) profile[f] = data[f];
    });

    const user = await User.findById(req.user.id);
    const fullName = profile.fullName || user.name;
    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide your full name in Step 1.' });
    }

    if (!profile.highestQualification && !profile.degreeCourseName) {
      return res.status(400).json({ success: false, message: 'Please provide your highest qualification in Step 2.' });
    }

    const hasSubjects = (profile.subjects && profile.subjects.length > 0) ||
                        (profile.customSubjects && profile.customSubjects.length > 0) ||
                        (profile.subjectsPreviouslyTaught && profile.subjectsPreviouslyTaught.length > 0);
    if (!hasSubjects) {
      return res.status(400).json({ success: false, message: 'Please select or add at least one subject in Step 4.' });
    }

    if (!profile.hourlyFee || Number(profile.hourlyFee) <= 0) {
      return res.status(400).json({ success: false, message: 'Please set a valid hourly fee in Step 6.' });
    }

    if (!profile.headline || !profile.headline.trim()) {
      return res.status(400).json({ success: false, message: 'Please enter a professional headline in Step 7.' });
    }

    if (!profile.bio || profile.bio.trim().length < 20) {
      return res.status(400).json({ success: false, message: 'Please provide an About Me description of at least 20 characters in Step 7.' });
    }

    if (profile.termsAccepted !== true && data.termsAccepted !== true) {
      return res.status(400).json({ success: false, message: 'Please review and accept the Privacy Policy and Platform Terms in Step 9.' });
    }

    // Map teaching modes cleanly to system constants
    const mappedModes = [];
    const modePrefs = profile.teachingModePreferences || [];
    if (modePrefs.some(m => m.toLowerCase().includes('online'))) mappedModes.push('online');
    if (modePrefs.some(m => m.toLowerCase().includes("student's home") || m.toLowerCase().includes('student_home'))) mappedModes.push('student_home');
    if (modePrefs.some(m => m.toLowerCase().includes('centre') || m.toLowerCase().includes('tutor_centre') || m.toLowerCase().includes("tutor's home"))) mappedModes.push('tutor_centre');

    profile.teachingModes = mappedModes.length > 0 ? mappedModes : (profile.teachingModes?.length > 0 ? profile.teachingModes : ['online']);

    // Build consolidated classes array
    const allClasses = new Set(profile.classes || []);
    (profile.schoolClassGroups || []).forEach(grp => allClasses.add(grp));
    (profile.classesPreviouslyTaught || []).forEach(c => allClasses.add(c));
    profile.classes = Array.from(allClasses);

    // Build consolidated subjects array
    const allSubjects = new Set(profile.subjects || []);
    (profile.customSubjects || []).forEach(s => allSubjects.add(s));
    (profile.subjectsPreviouslyTaught || []).forEach(s => allSubjects.add(s));
    profile.subjects = Array.from(allSubjects);

    // Calculate experience
    const yrs = Number(profile.experienceYears) || 0;
    const mos = Number(profile.experienceMonths) || 0;
    profile.yearsOfExperience = yrs + (mos >= 6 ? 1 : 0);

    // Fee structure sync
    profile.feeStructure = profile.feeStructure || {};
    profile.feeStructure.hourlyRate = Number(profile.hourlyFee) || 500;
    if (profile.monthlyFee) profile.feeStructure.monthlyRate = Number(profile.monthlyFee);
    profile.demoClassAvailable = profile.trialClassAvailable !== false;
    profile.demoClassFee = Number(profile.trialClassFee) || 0;

    // Locality sync
    if (profile.area) profile.primaryLocality = profile.area;
    if (profile.city) profile.city = profile.city;

    // Mark published
    profile.profileStatus = 'published';
    profile.applicationStatus = 'applied';
    profile.isInCart = true;
    profile.isPublished = true;
    profile.isAcceptingStudents = true;
    profile.termsAccepted = true;
    profile.submittedAt = new Date();
    profile.registrationStep = 9;

    if (!profile.applicationId) {
      const randomSuffix = Math.floor(10000 + Math.random() * 90000);
      profile.applicationId = `SL-TUT-${randomSuffix}`;
    }

    profile.statusHistory.push({
      status: 'applied',
      changedBy: req.user.id,
      reason: 'Application submitted by tutor'
    });

    if (data.fullName && data.fullName.trim()) {
      await User.findByIdAndUpdate(req.user.id, { name: data.fullName.trim() });
    }

    await profile.save();

    const qualifications = await TutorQualification.find({ tutor: profile._id });
    const completion = calculateProfileCompletion(profile, qualifications);

    const updatedProfile = await TutorProfile.findById(profile._id).populate('user', 'name email phone avatar role');

    res.json({
      success: true,
      message: 'Congratulations! Your tutor profile is submitted and now live on ShikshaLink.',
      profile: updatedProfile,
      profileCompletion: completion
    });
  } catch (err) {
    next(err);
  }
};

// Upload Tutor Document (Identity, Qualification, Resume, Other)
export const uploadTutorDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select a document file to upload.' });
    }

    const { docType = 'other', title = '' } = req.body;
    let profile = await TutorProfile.findOne({ user: req.user.id });
    if (!profile) {
      profile = new TutorProfile({ user: req.user.id, profileStatus: 'draft' });
    }

    const newDoc = {
      docType,
      title: title || req.file.originalname,
      path: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      status: 'pending',
      uploadedAt: new Date()
    };

    profile.verificationDocuments.push(newDoc);

    // If it is a qualification certificate, also sync to TutorQualification model for admin queue
    if (docType === 'qualification') {
      await TutorQualification.create({
        tutor: profile._id,
        tutorUser: req.user.id,
        degree: title || profile.highestQualification || 'Degree Certificate',
        institution: profile.collegeUniversity || 'University / Board',
        fieldOfStudy: profile.degreeCourseName || '',
        passingYear: profile.passingYear || new Date().getFullYear(),
        documentPath: req.file.filename,
        documentOriginalName: req.file.originalname,
        documentMimeType: req.file.mimetype,
        verificationStatus: 'pending'
      });
    }

    if (docType === 'resume') {
      profile.resumeDocument = {
        path: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        uploadedAt: new Date()
      };
    }

    await profile.save();

    res.status(201).json({
      success: true,
      message: `${docType.charAt(0).toUpperCase() + docType.slice(1)} document uploaded securely.`,
      document: newDoc,
      verificationDocuments: profile.verificationDocuments
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
      professionalTitle,
      shortIntro,
      qualificationDisplay,
      organisation,
      educationDetails,
      programmingSkills,
      teachingMethodologyList,
      classSubjectMapping,
      serviceArea,
      experienceDetails,
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
    if (professionalTitle !== undefined) profile.professionalTitle = professionalTitle.trim();
    if (shortIntro !== undefined) profile.shortIntro = shortIntro.trim();
    if (qualificationDisplay !== undefined) profile.qualificationDisplay = qualificationDisplay.trim();
    if (organisation !== undefined) profile.organisation = { ...profile.organisation, ...organisation };
    if (educationDetails !== undefined) profile.educationDetails = { ...profile.educationDetails, ...educationDetails };
    if (programmingSkills !== undefined) profile.programmingSkills = programmingSkills;
    if (teachingMethodologyList !== undefined) profile.teachingMethodologyList = teachingMethodologyList;
    if (classSubjectMapping !== undefined) profile.classSubjectMapping = classSubjectMapping;
    if (serviceArea !== undefined) profile.serviceArea = { ...profile.serviceArea, ...serviceArea };
    if (experienceDetails !== undefined) profile.experienceDetails = { ...profile.experienceDetails, ...experienceDetails };
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
    if (req.body.profileStatus !== undefined) {
      profile.profileStatus = req.body.profileStatus;
    } else if (profile.profileStatus === 'draft' && (headline || bio || teachingModes)) {
      profile.profileStatus = 'published';
      profile.applicationStatus = 'approved';
    }

    // Handle avatar upload if included in multipart request
    if (req.file) {
      const avatarUrl = `/uploads/public/${req.file.filename}`;
      await User.findByIdAndUpdate(req.user.id, { avatar: avatarUrl });
    }

    await profile.save();

    const updatedProfile = await TutorProfile.findById(profile._id).populate('user', 'name avatar email phone role');

    res.json({
      success: true,
      message: 'Tutor profile updated successfully.',
      profile: updatedProfile
    });
  } catch (err) {
    next(err);
  }
};

// Upload tutor avatar directly
export const uploadTutorAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select an image file to upload.' });
    }
    const avatarUrl = `/uploads/public/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(req.user.id, { avatar: avatarUrl }, { new: true });
    res.json({
      success: true,
      message: 'Profile photo uploaded successfully.',
      avatarUrl,
      user
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
    let docPath = null;
    let docMime = 'application/pdf';
    let docName = 'document.pdf';

    // 1. Try finding in TutorQualification
    const qualification = await TutorQualification.findById(req.params.id);
    if (qualification) {
      if (qualification.tutorUser.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You do not have permission to view this confidential qualification document.'
        });
      }
      docPath = qualification.documentPath;
      docMime = qualification.documentMimeType;
      docName = qualification.documentOriginalName;
    } else {
      // 2. Try finding in TutorProfile.verificationDocuments
      const profile = await TutorProfile.findOne({
        'verificationDocuments._id': req.params.id
      });
      if (!profile) {
        return res.status(404).json({ success: false, message: 'Document record not found.' });
      }
      if (profile.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You do not have permission to view this confidential qualification document.'
        });
      }
      const vDoc = profile.verificationDocuments.id(req.params.id);
      if (!vDoc) {
        return res.status(404).json({ success: false, message: 'Document not found.' });
      }
      docPath = vDoc.path;
      docMime = vDoc.mimeType;
      docName = vDoc.originalName;
    }

    const filePath = path.join(__dirname, '../../uploads/private', docPath);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File not found on server.' });
    }

    res.setHeader('Content-Type', docMime || 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${docName || 'document.pdf'}"`);
    res.sendFile(filePath);
  } catch (err) {
    next(err);
  }
};
