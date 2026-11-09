import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  User,
  GraduationCap,
  BookOpen,
  Layers,
  MapPin,
  Clock,
  DollarSign,
  FileText,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Save,
  Upload,
  Camera,
  Trash2,
  Plus,
  AlertCircle,
  HelpCircle,
  Info,
  Check,
  Lock,
  Sparkles,
  ArrowRight,
  FileCheck,
  Calendar,
  Phone,
  Mail,
  Home as HomeIcon,
  Laptop,
  ExternalLink
} from 'lucide-react';
import { apiRequest, getAvatarUrl, getDocumentUrl } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const TOTAL_STEPS = 9;

const STEP_METADATA = [
  { id: 1, title: 'Personal Details', short: 'Personal', icon: User },
  { id: 2, title: 'Education & Qualifications', short: 'Education', icon: GraduationCap },
  { id: 3, title: 'Teaching Experience', short: 'Experience', icon: BookOpen },
  { id: 4, title: 'Classes & Subjects', short: 'Subjects', icon: Layers },
  { id: 5, title: 'Teaching Preferences', short: 'Preferences', icon: MapPin },
  { id: 6, title: 'Fees & Availability', short: 'Fees', icon: DollarSign },
  { id: 7, title: 'About the Tutor', short: 'About', icon: FileText },
  { id: 8, title: 'Documents & Verification', short: 'Documents', icon: ShieldCheck },
  { id: 9, title: 'Review & Submit', short: 'Review', icon: CheckCircle2 }
];

const SCHOOL_CLASS_GROUPS = [
  'Classes 1–5',
  'Classes 6–8',
  'Classes 9–10',
  'Classes 11–12'
];

const PREDEFINED_SUBJECTS = [
  'Mathematics',
  'Science',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'Hindi',
  'Social Studies (SST)',
  'History',
  'Geography',
  'Political Science',
  'Economics',
  'Accountancy',
  'Business Studies',
  'Computer Science',
  'Programming Languages',
  'Other'
];

const ADDITIONAL_CATEGORIES = [
  'College-Level Subjects',
  'Programming and Computer Courses',
  'Competitive Exam Preparation',
  'Other'
];

const TEACHING_MODES = [
  { id: "Student's Home", label: "Student's Home", desc: "1-on-1 tutoring at student doorstep" },
  { id: "Tutor's Home / Centre", label: "Tutor's Home / Centre", desc: "Small-batch or 1-on-1 at your centre" },
  { id: "Online Classes", label: "Online Classes", desc: "Live remote interactive video sessions" },
  { id: "Group Tuition", label: "Group Tuition", desc: "Small batches of 3-8 students" },
  { id: "One-to-One Tuition", label: "One-to-One Tuition", desc: "Dedicated individual attention" }
];

const STUDENT_LEVELS = [
  'Primary',
  'Middle School',
  'Secondary',
  'Senior Secondary',
  'College',
  'Working Professionals'
];

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

const TIME_SLOTS = [
  'Morning (7:00 AM - 11:00 AM)',
  'Afternoon (11:00 AM - 4:00 PM)',
  'Evening (4:00 PM - 8:00 PM)',
  'Night (8:00 PM - 10:00 PM)'
];

const COMMON_LANGUAGES = [
  'English',
  'Hindi',
  'Bengali',
  'Punjabi',
  'Tamil',
  'Telugu',
  'Marathi',
  'Sanskrit',
  'French'
];

export const TutorRegistrationWizard = () => {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [savingDraft, setSavingDraft] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Profile avatar
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const avatarInputRef = useRef(null);

  // Form State across all 8 steps
  const [formData, setFormData] = useState({
    // Step 1: Personal
    avatar: '',
    fullName: '',
    dateOfBirth: '',
    gender: '',
    mobileNumber: '',
    email: '',
    whatsappNumber: '',
    city: 'Delhi',
    area: 'Mayur Vihar Phase 1',
    pincode: '110091',
    fullAddressPrivate: '',

    // Step 2: Education
    highestQualification: 'Post Graduate',
    degreeCourseName: '',
    collegeUniversity: '',
    passingYear: 2020,
    expectedGraduationYear: '',
    additionalCertifications: '',
    qualificationsList: [],

    // Step 3: Experience
    experienceYears: 2,
    experienceMonths: 0,
    teachingInstitutions: '',
    classesPreviouslyTaught: [],
    subjectsPreviouslyTaught: [],
    experienceDescription: '',
    resumeDocument: null,

    // Step 4: Classes & Subjects
    schoolClassGroups: ['Classes 9–10', 'Classes 11–12'],
    subjects: ['Mathematics'],
    customSubjects: [],
    additionalTeachingCategories: [],

    // Step 5: Preferences
    teachingModePreferences: ["Student's Home", 'Online Classes'],
    preferredStudentLevels: ['Secondary', 'Senior Secondary'],
    preferredTeachingAreas: ['Mayur Vihar Phase 1', 'Patparganj'],
    maxTravelDistanceKm: 5,
    availableDays: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
    availableTimeSlots: ['Evening (4:00 PM - 8:00 PM)'],
    preferredBatchSize: 'One-to-One Tuition',
    onlineOfflinePreference: 'Both Online and Offline',
    teachingLanguages: ['English', 'Hindi'],

    // Step 6: Fees & Availability
    hourlyFee: 600,
    monthlyFee: 5000,
    trialClassAvailable: true,
    trialClassFee: 0,
    weeklyAvailability: '15-20 hours per week',
    preferredPaymentMethods: ['UPI', 'Bank Transfer', 'Cash'],

    // Step 7: About
    headline: '',
    bio: '',
    teachingMethodology: 'Conceptual clarity first with structured numerical practice, weekly mock tests, and personalized doubt sessions.',
    strengthsAndSpecializations: 'CBSE Board exam scoring techniques, mental math, patient doubt explanation.',
    achievements: '',
    awardsCertifications: '',

    // Step 8: Documents
    verificationDocuments: [],

    // Step 9: Acceptance
    termsAccepted: true
  });

  // Custom subject input state
  const [customSubjectInput, setCustomSubjectInput] = useState('');
  // Custom area input state
  const [customAreaInput, setCustomAreaInput] = useState('');

  // Additional qualification form
  const [newDegree, setNewDegree] = useState('');
  const [newInstitution, setNewInstitution] = useState('');
  const [newPassingYear, setNewPassingYear] = useState('');
  const [newFieldOfStudy, setNewFieldOfStudy] = useState('');

  // Uploading document states
  const [uploadingDocType, setUploadingDocType] = useState(null);
  const docFileInputRef = useRef(null);
  const activeUploadCategoryRef = useRef('qualification');

  // Load existing profile / draft on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await apiRequest('/tutors/profile/me');
        if (res.success && res.profile) {
          const p = res.profile;
          const initialAvatar = p.avatar || p.user?.avatar || user?.avatar || '';
          setFormData((prev) => ({
            ...prev,
            avatar: initialAvatar || prev.avatar,
            fullName: p.fullName || p.user?.name || prev.fullName,
            email: p.user?.email || prev.email,
            mobileNumber: p.user?.phone || prev.mobileNumber,
            dateOfBirth: p.dateOfBirth || prev.dateOfBirth,
            gender: p.gender || prev.gender,
            whatsappNumber: p.whatsappNumber || prev.whatsappNumber,
            city: p.city || prev.city,
            area: p.area || p.primaryLocality || prev.area,
            pincode: p.pincode || prev.pincode,
            fullAddressPrivate: p.fullAddressPrivate || prev.fullAddressPrivate,

            highestQualification: p.highestQualification || prev.highestQualification,
            degreeCourseName: p.degreeCourseName || prev.degreeCourseName,
            collegeUniversity: p.collegeUniversity || prev.collegeUniversity,
            passingYear: p.passingYear || prev.passingYear,
            expectedGraduationYear: p.expectedGraduationYear || prev.expectedGraduationYear,
            additionalCertifications: p.additionalCertifications || prev.additionalCertifications,
            qualificationsList: p.qualificationsList || prev.qualificationsList,

            experienceYears: p.experienceYears !== undefined ? p.experienceYears : (p.yearsOfExperience || prev.experienceYears),
            experienceMonths: p.experienceMonths || 0,
            teachingInstitutions: p.teachingInstitutions || p.previousExperience || prev.teachingInstitutions,
            classesPreviouslyTaught: p.classesPreviouslyTaught || prev.classesPreviouslyTaught,
            subjectsPreviouslyTaught: p.subjectsPreviouslyTaught || prev.subjectsPreviouslyTaught,
            experienceDescription: p.experienceDescription || prev.experienceDescription,
            resumeDocument: p.resumeDocument || prev.resumeDocument,

            schoolClassGroups: p.schoolClassGroups?.length ? p.schoolClassGroups : prev.schoolClassGroups,
            subjects: p.subjects?.length ? p.subjects : prev.subjects,
            customSubjects: p.customSubjects || prev.customSubjects,
            additionalTeachingCategories: p.additionalTeachingCategories || prev.additionalTeachingCategories,

            teachingModePreferences: p.teachingModePreferences?.length ? p.teachingModePreferences : prev.teachingModePreferences,
            preferredStudentLevels: p.preferredStudentLevels?.length ? p.preferredStudentLevels : prev.preferredStudentLevels,
            preferredTeachingAreas: p.preferredTeachingAreas?.length ? p.preferredTeachingAreas : prev.preferredTeachingAreas,
            maxTravelDistanceKm: p.maxTravelDistanceKm || p.homeTuitionDetails?.maxTravelDistanceKm || prev.maxTravelDistanceKm,
            availableDays: p.availableDays?.length ? p.availableDays : prev.availableDays,
            availableTimeSlots: p.availableTimeSlots?.length ? p.availableTimeSlots : prev.availableTimeSlots,
            preferredBatchSize: p.preferredBatchSize || prev.preferredBatchSize,
            onlineOfflinePreference: p.onlineOfflinePreference || prev.onlineOfflinePreference,
            teachingLanguages: p.teachingLanguages?.length ? p.teachingLanguages : prev.teachingLanguages,

            hourlyFee: p.hourlyFee || p.feeStructure?.hourlyRate || prev.hourlyFee,
            monthlyFee: p.monthlyFee || p.feeStructure?.monthlyRate || prev.monthlyFee,
            trialClassAvailable: p.trialClassAvailable !== undefined ? p.trialClassAvailable : prev.trialClassAvailable,
            trialClassFee: p.trialClassFee || p.demoClassFee || 0,
            weeklyAvailability: p.weeklyAvailability || prev.weeklyAvailability,
            preferredPaymentMethods: p.preferredPaymentMethods?.length ? p.preferredPaymentMethods : prev.preferredPaymentMethods,

            headline: p.headline || prev.headline,
            bio: p.bio || prev.bio,
            teachingMethodology: p.teachingMethodology || prev.teachingMethodology,
            strengthsAndSpecializations: p.strengthsAndSpecializations || prev.strengthsAndSpecializations,
            achievements: p.achievements || prev.achievements,
            awardsCertifications: p.awardsCertifications || prev.awardsCertifications,

            verificationDocuments: p.verificationDocuments || prev.verificationDocuments,
            termsAccepted: Boolean(p.termsAccepted)
          }));

          if (p.user?.avatar || p.avatar || user?.avatar) {
            setPhotoPreview(p.user?.avatar || p.avatar || user?.avatar);
          }

          if (res.profileCompletion !== undefined) {
            setCompletionPercentage(res.profileCompletion);
          }

          // If tutor already published and no specific step requested, redirect to dashboard
          if (p.profileStatus === 'published' && !searchParams.get('step')) {
            navigate('/tutor', { replace: true });
            return;
          }

          // If step query param provided, honor it, otherwise resume at saved step
          const stepParam = parseInt(searchParams.get('step'), 10);
          if (stepParam >= 1 && stepParam <= 9) {
            setCurrentStep(stepParam);
          } else if (p.registrationStep >= 1 && p.registrationStep <= 9) {
            setCurrentStep(p.registrationStep);
          }
        }
      } catch (err) {
        showToast('Could not load saved tutor draft', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [searchParams, showToast, navigate]);

  const isSavingRef = useRef(false);
  const pendingSaveRef = useRef(null);
  const lastSavedJsonRef = useRef('');
  const formDataRef = useRef(formData);
  formDataRef.current = formData;

  // Optimized, non-blocking auto-save function
  const saveDraftToServer = useCallback(async (dataToSave, targetStep = currentStep) => {
    const payload = {
      ...dataToSave,
      registrationStep: targetStep
    };

    // Skip redundant network requests if data has not changed
    const payloadJson = JSON.stringify(payload);
    if (payloadJson === lastSavedJsonRef.current) {
      return;
    }

    if (isSavingRef.current) {
      pendingSaveRef.current = { dataToSave, targetStep };
      return;
    }

    isSavingRef.current = true;
    setSavingDraft(true);
    try {
      const res = await apiRequest('/tutors/draft', {
        method: 'PUT',
        body: payloadJson
      });
      if (res.success) {
        lastSavedJsonRef.current = payloadJson;
        setLastSavedTime(new Date());
        if (res.profileCompletion !== undefined) {
          setCompletionPercentage((prev) => (prev !== res.profileCompletion ? res.profileCompletion : prev));
        }
      }
    } catch (err) {
      console.warn('Draft auto-save notice:', err.message);
    } finally {
      isSavingRef.current = false;
      setSavingDraft(false);

      if (pendingSaveRef.current) {
        const nextSave = pendingSaveRef.current;
        pendingSaveRef.current = null;
        saveDraftToServer(nextSave.dataToSave, nextSave.targetStep);
      }
    }
  }, [currentStep]);

  // Debounced effect for meaningful form changes
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const timer = setTimeout(() => {
      saveDraftToServer(formDataRef.current, currentStep);
    }, 1500);

    return () => clearTimeout(timer);
  }, [formData, currentStep, saveDraftToServer]);

  // Manual save draft click
  const handleManualSaveDraft = async () => {
    await saveDraftToServer(formData, currentStep);
    showToast('Draft progress saved successfully to your account.', 'success');
  };

  // Instant step change with non-blocking background saving
  const handleGoToStep = (stepNum) => {
    if (stepNum < 1 || stepNum > TOTAL_STEPS) return;
    setCurrentStep(stepNum);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Save draft in the background without blocking UI
    saveDraftToServer(formData, stepNum);
  };

  const handleNextStep = () => {
    handleGoToStep(currentStep + 1);
  };

  const handlePrevStep = () => {
    handleGoToStep(currentStep - 1);
  };

  // Avatar Upload
  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (JPEG, PNG, WebP).', 'error');
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      showToast('Image size cannot exceed 3MB.', 'error');
      return;
    }

    const tempBlob = URL.createObjectURL(file);
    setPhotoPreview(tempBlob);
    setUploadingPhoto(true);

    const data = new FormData();
    data.append('avatar', file);

    try {
      const res = await apiRequest('/tutors/avatar', {
        method: 'POST',
        body: data
      });
      if (res.success && res.avatarUrl) {
        setPhotoPreview(res.avatarUrl);
        setFormData((prev) => ({ ...prev, avatar: res.avatarUrl }));
        formDataRef.current = { ...formDataRef.current, avatar: res.avatarUrl };
        // Immediately persist to draft on backend
        saveDraftToServer({ ...formDataRef.current, avatar: res.avatarUrl });
        showToast('Profile photo updated successfully!', 'success');
        refreshUser();
      }
    } catch (err) {
      showToast(err.message || 'Photo upload failed', 'error');
      // If upload failed, revert preview to saved avatar
      setPhotoPreview(formDataRef.current.avatar || user?.avatar || null);
    } finally {
      setUploadingPhoto(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  // Document Upload
  const handleTriggerDocUpload = (docType) => {
    activeUploadCategoryRef.current = docType;
    if (docFileInputRef.current) {
      docFileInputRef.current.click();
    }
  };

  const handleDocFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showToast('File size must be under 10MB.', 'error');
      return;
    }

    const docType = activeUploadCategoryRef.current;
    setUploadingDocType(docType);

    const data = new FormData();
    data.append('document', file);
    data.append('docType', docType);
    data.append('title', file.name.replace(/\.[^/.]+$/, ''));

    try {
      const res = await apiRequest('/tutors/upload-document', {
        method: 'POST',
        body: data
      });
      if (res.success) {
        showToast(`${file.name} uploaded securely for verification.`, 'success');
        setFormData((prev) => ({
          ...prev,
          verificationDocuments: res.verificationDocuments || [...prev.verificationDocuments, res.document]
        }));
      }
    } catch (err) {
      showToast(err.message || 'Document upload failed', 'error');
    } finally {
      setUploadingDocType(null);
      if (docFileInputRef.current) docFileInputRef.current.value = '';
    }
  };

  // Add / Remove Qualifications
  const handleAddQualification = () => {
    if (!newDegree || !newInstitution) {
      showToast('Please provide both degree title and institution.', 'error');
      return;
    }
    const qual = {
      degree: newDegree.trim(),
      institution: newInstitution.trim(),
      fieldOfStudy: newFieldOfStudy.trim(),
      passingYear: Number(newPassingYear) || new Date().getFullYear(),
      verificationStatus: 'pending'
    };
    setFormData((prev) => ({
      ...prev,
      qualificationsList: [...prev.qualificationsList, qual]
    }));
    setNewDegree('');
    setNewInstitution('');
    setNewPassingYear('');
    setNewFieldOfStudy('');
    showToast('Qualification added.', 'success');
  };

  const handleRemoveQualification = (index) => {
    setFormData((prev) => ({
      ...prev,
      qualificationsList: prev.qualificationsList.filter((_, i) => i !== index)
    }));
  };

  // Toggle multi-select chips
  const toggleArrayItem = (key, item) => {
    setFormData((prev) => {
      const currentList = prev[key] || [];
      const exists = currentList.includes(item);
      const updated = exists ? currentList.filter((x) => x !== item) : [...currentList, item];
      return { ...prev, [key]: updated };
    });
  };

  // Add custom subject
  const handleAddCustomSubject = (e) => {
    e.preventDefault();
    const sub = customSubjectInput.trim();
    if (!sub) return;
    if (formData.customSubjects.includes(sub) || formData.subjects.includes(sub)) {
      showToast('Subject already added.', 'info');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      customSubjects: [...prev.customSubjects, sub],
      subjects: [...prev.subjects, sub]
    }));
    setCustomSubjectInput('');
  };

  // Add custom area
  const handleAddCustomArea = (e) => {
    e.preventDefault();
    const a = customAreaInput.trim();
    if (!a) return;
    if (formData.preferredTeachingAreas.includes(a)) {
      showToast('Area already in list.', 'info');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      preferredTeachingAreas: [...prev.preferredTeachingAreas, a]
    }));
    setCustomAreaInput('');
  };

  // Final Profile Submission
  const handleSubmitProfile = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    // Prepare complete data with safe defaults so user is never rejected or bounced back
    const finalFullName = (formData.fullName || user?.name || 'Academic Educator').trim();
    const finalHeadline = (formData.headline || (user?.name ? `${user.name} - Academic Tutor` : 'Professional Academic Tutor')).trim();
    const finalBio = (formData.bio && formData.bio.trim().length >= 20)
      ? formData.bio.trim()
      : (formData.bio?.trim() || 'Experienced and dedicated academic tutor committed to student growth, concept clarity, and academic success.');
    const finalSubjects = (formData.subjects && formData.subjects.length > 0)
      ? formData.subjects
      : (formData.customSubjects && formData.customSubjects.length > 0 ? formData.customSubjects : ['Mathematics']);
    const finalHourlyFee = Number(formData.hourlyFee) > 0 ? Number(formData.hourlyFee) : 600;

    const safeAvatar = (formData.avatar && typeof formData.avatar === 'string' && !formData.avatar.startsWith('blob:'))
      ? formData.avatar
      : (photoPreview && typeof photoPreview === 'string' && !photoPreview.startsWith('blob:')
        ? photoPreview
        : (user?.avatar && typeof user.avatar === 'string' && !user.avatar.startsWith('blob:') ? user.avatar : ''));

    const finalData = {
      ...formData,
      fullName: finalFullName,
      email: formData.email || user?.email || '',
      mobileNumber: formData.mobileNumber || user?.phone || '',
      headline: finalHeadline,
      bio: finalBio,
      highestQualification: formData.highestQualification || 'Post Graduate',
      degreeCourseName: formData.degreeCourseName || formData.highestQualification || 'Master / Bachelor Degree',
      subjects: finalSubjects,
      hourlyFee: finalHourlyFee,
      avatar: safeAvatar,
      termsAccepted: true
    };

    setFormData(finalData);
    setSubmitting(true);
    try {
      const res = await apiRequest('/tutors/submit', {
        method: 'POST',
        body: JSON.stringify(finalData)
      });
      if (res.success) {
        showToast('Application submitted successfully! Your profile is now in Admin review.', 'success');
        setShowSuccessModal(true);
        refreshUser();
      } else {
        showToast(res.message || 'Submission failed. Please check form fields.', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Submission failed. Please check required fields.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-slate-700 animate-pulse">
          Loading your tutor registration draft...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/80 py-8 px-4 sm:px-6 lg:px-8">
      {/* Hidden file inputs for uploads */}
      <input
        type="file"
        ref={avatarInputRef}
        onChange={handleAvatarFileChange}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
      />
      <input
        type="file"
        ref={docFileInputRef}
        onChange={handleDocFileChange}
        accept="application/pdf,image/jpeg,image/png"
        className="hidden"
      />

      <div className="max-w-5xl mx-auto space-y-6">
        {/* TOP STATUS BAR & AUTOSAVE INDICATOR */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/30 font-black text-sm">
              {currentStep}/{TOTAL_STEPS}
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>Tutor Registration</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 font-extrabold border border-teal-200">
                  {completionPercentage}% Complete
                </span>
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Step {currentStep} of {TOTAL_STEPS}: {STEP_METADATA[currentStep - 1].title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {/* Auto-save status feedback */}
            <div className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
              {savingDraft ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving draft...</span>
                </>
              ) : lastSavedTime ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-slate-500">
                    Saved at {lastSavedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </>
              ) : (
                <span className="text-slate-400">Autosave active</span>
              )}
            </div>

            <button
              type="button"
              onClick={handleManualSaveDraft}
              disabled={savingDraft}
              className="px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5 text-slate-500" />
              <span>Save Draft</span>
            </button>
          </div>
        </div>

        {/* STEP PROGRESS BAR (DESKTOP & MOBILE RESPONSIVE) */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-sm overflow-x-auto">
          <div className="flex items-center justify-between min-w-[700px] sm:min-w-0">
            {STEP_METADATA.map((step, idx) => {
              const Icon = step.icon;
              const isPassed = currentStep > step.id;
              const isCurrent = currentStep === step.id;

              return (
                <React.Fragment key={step.id}>
                  <button
                    type="button"
                    onClick={() => handleGoToStep(step.id)}
                    className="flex flex-col items-center gap-1.5 group cursor-pointer text-left focus:outline-hidden"
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all ${
                        isCurrent
                          ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30 ring-4 ring-teal-100 scale-105'
                          : isPassed
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {isPassed ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                    </div>
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider text-center max-w-[70px] truncate ${
                        isCurrent ? 'text-teal-700 font-extrabold' : 'text-slate-500'
                      }`}
                    >
                      {step.short}
                    </span>
                  </button>
                  {idx < STEP_METADATA.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-1 rounded-full transition-colors ${
                        currentStep > idx + 1 ? 'bg-emerald-500' : 'bg-slate-200'
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* FORM CONTENT CONTAINER */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-sm space-y-8">
          {/* ========================================================================= */}
          {/* STEP 1: PERSONAL DETAILS */}
          {/* ========================================================================= */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <User className="w-5 h-5 text-teal-600" />
                  <span>Step 1: Personal Details</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Tell parents about your identity. Private contact information remains strictly confidential.
                </p>
              </div>

              {/* Profile Photo Upload */}
              <div className="flex flex-col sm:flex-row items-center gap-6 p-5 bg-slate-50/80 rounded-2xl border border-slate-200/80">
                <div className="relative group">
                  <div className="relative w-24 h-24 rounded-2xl bg-teal-700 text-white flex items-center justify-center font-black text-2xl shadow-md overflow-hidden ring-4 ring-white">
                    <span className="select-none">{formData.fullName?.[0] || user?.name?.[0] || 'T'}</span>
                    {photoPreview && (
                      <img
                        src={getAvatarUrl(photoPreview)}
                        alt="Tutor"
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                    {uploadingPhoto && (
                      <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={uploadingPhoto}
                    className="absolute -bottom-2 -right-2 p-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-md transition-transform group-hover:scale-105 cursor-pointer"
                    title="Upload profile photo"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-1 text-center sm:text-left">
                  <h4 className="text-sm font-bold text-slate-900">Profile Photo</h4>
                  <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                    A clear, friendly headshot increases parent inquiries by 3x. JPEG, PNG, or WebP up to 3MB.
                  </p>
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={uploadingPhoto}
                    className="mt-2 text-xs font-bold text-teal-700 hover:underline inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingPhoto ? 'Uploading photo...' : 'Choose Photo File'}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Dr. Rajesh Verma"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  />
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Date of Birth <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Gender <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.mobileNumber}
                    onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                    placeholder="+91 98111 XXXXX"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="tutor@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  />
                </div>

                {/* WhatsApp Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    WhatsApp Number <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.whatsappNumber}
                    onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                    placeholder="+91 98111 XXXXX"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  />
                </div>

                {/* City & Area */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    City <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Delhi"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Area / Locality <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    placeholder="e.g. Mayur Vihar Phase 1"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  />
                </div>

                {/* PIN Code */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    PIN Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    placeholder="110091"
                    maxLength={6}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  />
                </div>
              </div>

              {/* Full Address (Private) */}
              <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80 space-y-2">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-700" />
                  <label className="text-xs font-bold text-slate-900">
                    Full Residential Address <span className="text-slate-400 font-normal">(Strictly Private)</span>
                  </label>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 font-bold ml-auto">
                    Never Exposed Publicly
                  </span>
                </div>
                <textarea
                  rows={2}
                  value={formData.fullAddressPrivate}
                  onChange={(e) => setFormData({ ...formData, fullAddressPrivate: e.target.value })}
                  placeholder="House/Flat number, building name, street, nearby landmark (used solely for admin verification and confirmed home tutoring confirmations)"
                  className="w-full px-3.5 py-2 rounded-xl border border-amber-300/80 text-xs font-semibold text-slate-800 focus:outline-hidden bg-white"
                />
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: EDUCATION AND QUALIFICATIONS */}
          {/* ========================================================================= */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-teal-600" />
                  <span>Step 2: Education and Qualifications</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  List your highest education degree, university, and certifications. Multiple qualifications are supported.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Highest Qualification */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Highest Qualification <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.highestQualification}
                    onChange={(e) => setFormData({ ...formData, highestQualification: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  >
                    <option value="Ph.D. / Doctorate">Ph.D. / Doctorate</option>
                    <option value="Post Graduate">Post Graduate / Master's (M.Sc, M.Tech, M.A., etc.)</option>
                    <option value="Graduate">Graduate / Bachelor's (B.Sc, B.Tech, B.A., etc.)</option>
                    <option value="Professional Certification">Professional Certification (CA, CS, CFA, etc.)</option>
                    <option value="Diploma">Diploma / Associate Degree</option>
                    <option value="High School">High School (Class 12th)</option>
                    <option value="Other">Other Qualification</option>
                  </select>
                </div>

                {/* Degree / Course Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Degree / Course Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.degreeCourseName}
                    onChange={(e) => setFormData({ ...formData, degreeCourseName: e.target.value })}
                    placeholder="e.g. M.Sc. in Physics or B.Tech Computer Science"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  />
                </div>

                {/* College / University */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    College / University <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.collegeUniversity}
                    onChange={(e) => setFormData({ ...formData, collegeUniversity: e.target.value })}
                    placeholder="e.g. Delhi University (St. Stephen's / Hindu College)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  />
                </div>

                {/* Passing Year */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Passing Year or Expected Graduation Year
                  </label>
                  <input
                    type="number"
                    min="1960"
                    max="2032"
                    value={formData.passingYear}
                    onChange={(e) => setFormData({ ...formData, passingYear: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  />
                </div>
              </div>

              {/* Additional Certifications */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Additional Qualifications or Certifications <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={formData.additionalCertifications}
                  onChange={(e) => setFormData({ ...formData, additionalCertifications: e.target.value })}
                  placeholder="e.g. CTET Qualified, B.Ed, Cambridge Certificate in Teaching, JEE Advanced State Ranker"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                />
              </div>

              {/* Multi-Qualification Sub-List */}
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                    Additional Degrees & Certificates
                  </h4>
                  <span className="text-xs text-slate-400">{formData.qualificationsList.length} added</span>
                </div>

                {formData.qualificationsList.length > 0 && (
                  <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-2xl overflow-hidden">
                    {formData.qualificationsList.map((item, idx) => (
                      <div key={idx} className="p-3.5 flex items-center justify-between gap-3 bg-slate-50/50">
                        <div>
                          <div className="font-bold text-xs text-slate-900">{item.degree}</div>
                          <div className="text-[11px] text-slate-500">
                            {item.institution} {item.passingYear ? `• ${item.passingYear}` : ''}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveQualification(idx)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Remove qualification"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add new qualification inline box */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-dashed border-slate-300 space-y-3">
                  <span className="text-xs font-bold text-slate-700 block">Add Another Degree / Certification:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                    <input
                      type="text"
                      placeholder="Degree (e.g. B.Ed)"
                      value={newDegree}
                      onChange={(e) => setNewDegree(e.target.value)}
                      className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                    />
                    <input
                      type="text"
                      placeholder="University / College"
                      value={newInstitution}
                      onChange={(e) => setNewInstitution(e.target.value)}
                      className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                    />
                    <input
                      type="text"
                      placeholder="Field of Study"
                      value={newFieldOfStudy}
                      onChange={(e) => setNewFieldOfStudy(e.target.value)}
                      className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                    />
                    <input
                      type="number"
                      placeholder="Year"
                      value={newPassingYear}
                      onChange={(e) => setNewPassingYear(e.target.value)}
                      className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddQualification}
                    className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Qualification</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: TEACHING EXPERIENCE */}
          {/* ========================================================================= */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-teal-600" />
                  <span>Step 3: Teaching Experience</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Specify your authentic teaching background. We only display what you enter — no automated inflations.
                </p>
              </div>

              {/* Years and Months Inputs */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Total Teaching Experience <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4 max-w-md">
                  <div>
                    <label className="text-[11px] text-slate-500 font-semibold block mb-0.5">Years</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="45"
                        value={formData.experienceYears}
                        onChange={(e) => setFormData({ ...formData, experienceYears: Number(e.target.value) })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 pr-12 focus:outline-hidden focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">Yrs</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 font-semibold block mb-0.5">Months</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="11"
                        value={formData.experienceMonths}
                        onChange={(e) => setFormData({ ...formData, experienceMonths: Number(e.target.value) })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 pr-12 focus:outline-hidden focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">Mos</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Current or Previous Institution */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Current or Previous Teaching Institution <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.teachingInstitutions}
                  onChange={(e) => setFormData({ ...formData, teachingInstitutions: e.target.value })}
                  placeholder="e.g. Ahlcon Public School, FIITJEE, Resonance, or Independent Home Tutor"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                />
              </div>

              {/* Teaching Experience Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Teaching Experience Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={formData.experienceDescription}
                  onChange={(e) => setFormData({ ...formData, experienceDescription: e.target.value })}
                  placeholder="Describe your student success history, number of students taught, boards covered (CBSE, ICSE, IB), and notable student score improvements."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                />
              </div>

              {/* Resume / CV Upload Card */}
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-0.5 text-center sm:text-left">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 justify-center sm:justify-start">
                    <FileText className="w-4 h-4 text-teal-600" />
                    <span>Resume / CV Document (Optional)</span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Upload your latest CV in PDF or DOC format for expedited admin verification.
                  </p>
                  {formData.resumeDocument && (
                    <div className="text-xs text-emerald-700 font-bold flex items-center gap-1 pt-1 justify-center sm:justify-start">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{formData.resumeDocument.originalName}</span>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleTriggerDocUpload('resume')}
                  disabled={uploadingDocType === 'resume'}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-2xs flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingDocType === 'resume' ? 'Uploading...' : 'Upload Resume'}</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 4: CLASSES AND SUBJECTS */}
          {/* ========================================================================= */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Layers className="w-5 h-5 text-teal-600" />
                  <span>Step 4: Classes and Subjects</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Select the student grades and academic subjects you specialize in. You can also add custom courses.
                </p>
              </div>

              {/* School Classes Groups */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  School Classes Taught <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {SCHOOL_CLASS_GROUPS.map((grp) => {
                    const selected = formData.schoolClassGroups.includes(grp);
                    return (
                      <button
                        type="button"
                        key={grp}
                        onClick={() => toggleArrayItem('schoolClassGroups', grp)}
                        className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer font-bold text-xs ${
                          selected
                            ? 'bg-teal-50 border-teal-600 text-teal-900 ring-2 ring-teal-600/20'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                        }`}
                      >
                        {grp}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Academic Subjects Chips */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Subjects Taught <span className="text-rose-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {PREDEFINED_SUBJECTS.map((sub) => {
                    const selected = formData.subjects.includes(sub);
                    return (
                      <button
                        type="button"
                        key={sub}
                        onClick={() => toggleArrayItem('subjects', sub)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                          selected
                            ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {selected && <Check className="w-3 h-3 inline mr-1" />}
                        {sub}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Subject Input */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Add Custom Subjects or Specific Courses
                </label>
                <form onSubmit={handleAddCustomSubject} className="flex gap-2 max-w-md">
                  <input
                    type="text"
                    value={customSubjectInput}
                    onChange={(e) => setCustomSubjectInput(e.target.value)}
                    placeholder="e.g. AP Calculus, Python for Kids, Spoken German"
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Add
                  </button>
                </form>
                {formData.customSubjects.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.customSubjects.map((cs) => (
                      <span
                        key={cs}
                        className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 text-[11px] font-bold border border-teal-200 flex items-center gap-1"
                      >
                        {cs}
                        <button
                          type="button"
                          onClick={() => toggleArrayItem('customSubjects', cs)}
                          className="hover:text-rose-500"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Additional Teaching Categories */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Additional Teaching Categories
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {ADDITIONAL_CATEGORIES.map((cat) => {
                    const selected = formData.additionalTeachingCategories.includes(cat);
                    return (
                      <label
                        key={cat}
                        className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer text-xs font-bold transition-colors ${
                          selected
                            ? 'bg-sky-50 border-sky-400 text-sky-950'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleArrayItem('additionalTeachingCategories', cat)}
                          className="rounded-sm text-teal-600 focus:ring-teal-500 w-4 h-4"
                        />
                        <span>{cat}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 5: TEACHING PREFERENCES */}
          {/* ========================================================================= */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-teal-600" />
                  <span>Step 5: Teaching Preferences</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Choose where and how you teach: student homes, your centre, online classes, and batch preferences.
                </p>
              </div>

              {/* Teaching Modes Multi-select */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Teaching Modes Accepted <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {TEACHING_MODES.map((mode) => {
                    const selected = formData.teachingModePreferences.includes(mode.id);
                    return (
                      <div
                        key={mode.id}
                        onClick={() => toggleArrayItem('teachingModePreferences', mode.id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-1 ${
                          selected
                            ? 'bg-teal-50 border-teal-600 ring-2 ring-teal-600/20'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900">{mode.label}</span>
                          {selected && <Check className="w-4 h-4 text-teal-600" />}
                        </div>
                        <p className="text-[11px] text-slate-500 leading-snug">{mode.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Preferred Student Levels */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Preferred Student Level <span className="text-rose-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {STUDENT_LEVELS.map((level) => {
                    const selected = formData.preferredStudentLevels.includes(level);
                    return (
                      <button
                        type="button"
                        key={level}
                        onClick={() => toggleArrayItem('preferredStudentLevels', level)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                          selected
                            ? 'bg-teal-600 text-white border-teal-600'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {level}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Teaching Areas & Max Travel */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Preferred Localities / Areas
                  </label>
                  <form onSubmit={handleAddCustomArea} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={customAreaInput}
                      onChange={(e) => setCustomAreaInput(e.target.value)}
                      placeholder="e.g. Preet Vihar, Laxmi Nagar"
                      className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-300"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Add
                    </button>
                  </form>
                  <div className="flex flex-wrap gap-1.5">
                    {formData.preferredTeachingAreas.map((area) => (
                      <span
                        key={area}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center gap-1"
                      >
                        {area}
                        <button
                          type="button"
                          onClick={() => toggleArrayItem('preferredTeachingAreas', area)}
                          className="hover:text-rose-500 text-slate-400 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Maximum Travel Radius: <span className="text-teal-700">{formData.maxTravelDistanceKm} km</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="25"
                    value={formData.maxTravelDistanceKm}
                    onChange={(e) => setFormData({ ...formData, maxTravelDistanceKm: Number(e.target.value) })}
                    className="w-full accent-teal-600 cursor-pointer mt-2"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold pt-1">
                    <span>1 km (Immediate locality)</span>
                    <span>10 km</span>
                    <span>25 km (Delhi NCR)</span>
                  </div>
                </div>
              </div>

              {/* Days & Time Slots */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Available Days of Week
                </label>
                <div className="flex flex-wrap gap-2">
                  {DAYS_OF_WEEK.map((d) => {
                    const selected = formData.availableDays.includes(d);
                    return (
                      <button
                        type="button"
                        key={d}
                        onClick={() => toggleArrayItem('availableDays', d)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                          selected
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Available Time Slots
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {TIME_SLOTS.map((slot) => {
                    const selected = formData.availableTimeSlots.includes(slot);
                    return (
                      <label
                        key={slot}
                        className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer text-xs font-bold transition-colors ${
                          selected
                            ? 'bg-teal-50 border-teal-400 text-teal-950'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleArrayItem('availableTimeSlots', slot)}
                          className="rounded-sm text-teal-600 focus:ring-teal-500 w-4 h-4"
                        />
                        <span>{slot}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Preferred Batch Size & Teaching Languages */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Preferred Batch Arrangement
                  </label>
                  <select
                    value={formData.preferredBatchSize}
                    onChange={(e) => setFormData({ ...formData, preferredBatchSize: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800"
                  >
                    <option value="One-to-One Tuition">One-to-One Tuition (Single Student)</option>
                    <option value="Small Batches (2-5 Students)">Small Batches (2-5 Students)</option>
                    <option value="Medium Batches (6-10 Students)">Medium Batches (6-10 Students)</option>
                    <option value="Both Individual and Batches">Both Individual and Batches</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Online / Offline Preference
                  </label>
                  <select
                    value={formData.onlineOfflinePreference}
                    onChange={(e) => setFormData({ ...formData, onlineOfflinePreference: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800"
                  >
                    <option value="Both Online and Offline">Both Online and Offline</option>
                    <option value="Online Only">Online Only</option>
                    <option value="Offline In-Person Only">Offline In-Person Only</option>
                  </select>
                </div>
              </div>

              {/* Languages Spoken */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Teaching Languages Spoken
                </label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_LANGUAGES.map((lang) => {
                    const selected = formData.teachingLanguages.includes(lang);
                    return (
                      <button
                        type="button"
                        key={lang}
                        onClick={() => toggleArrayItem('teachingLanguages', lang)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                          selected
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {lang}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 6: FEES AND AVAILABILITY */}
          {/* ========================================================================= */}
          {currentStep === 6 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-teal-600" />
                  <span>Step 6: Fees and Availability</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Clearly state your tuition charges. Hourly fees and monthly tuition are displayed transparently to parents.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Hourly Fee */}
                <div className="p-5 bg-teal-50/50 rounded-2xl border border-teal-200/80 space-y-2">
                  <label className="block text-xs font-extrabold text-teal-950 uppercase tracking-wider">
                    Hourly Fee (Per Hour) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 font-black text-slate-600">₹</span>
                    <input
                      type="number"
                      min="100"
                      step="50"
                      value={formData.hourlyFee}
                      onChange={(e) => setFormData({ ...formData, hourlyFee: Number(e.target.value) })}
                      placeholder="600"
                      className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-teal-300 text-sm font-black text-slate-900 bg-white"
                    />
                  </div>
                  <p className="text-[11px] text-teal-800">
                    Standard rate billed for 1-hour 1-on-1 tuition sessions or demo classes.
                  </p>
                </div>

                {/* Monthly Fee */}
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                    Monthly Package Fee <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 font-black text-slate-600">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="500"
                      value={formData.monthlyFee}
                      onChange={(e) => setFormData({ ...formData, monthlyFee: Number(e.target.value) })}
                      placeholder="5000"
                      className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-black text-slate-900 bg-white"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Typically covers 12-16 classes/month (e.g. 3-4 classes per week).
                  </p>
                </div>
              </div>

              {/* Trial Class Available Toggle */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <h4 className="font-bold text-xs text-slate-900">Trial Class / Demo Available?</h4>
                  <p className="text-[11px] text-slate-500 max-w-md">
                    Offering a free or nominal introductory demo helps build parent confidence before committing to a monthly pack.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, trialClassAvailable: true, trialClassFee: 0 })}
                    className={`px-3.5 py-2 text-xs font-bold rounded-xl border cursor-pointer transition-colors ${
                      formData.trialClassAvailable && formData.trialClassFee === 0
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    Free Demo Class
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, trialClassAvailable: false })}
                    className={`px-3.5 py-2 text-xs font-bold rounded-xl border cursor-pointer transition-colors ${
                      !formData.trialClassAvailable
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    No Trial Class
                  </button>
                </div>
              </div>

              {/* Weekly Availability & Preferred Payment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Weekly Teaching Availability
                  </label>
                  <input
                    type="text"
                    value={formData.weeklyAvailability}
                    onChange={(e) => setFormData({ ...formData, weeklyAvailability: e.target.value })}
                    placeholder="e.g. 15-20 hours / week, flexible on weekends"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Preferred Payment Methods
                  </label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {['UPI', 'Direct Bank Transfer', 'Cash', 'Platform Escrow'].map((method) => {
                      const selected = formData.preferredPaymentMethods.includes(method);
                      return (
                        <button
                          type="button"
                          key={method}
                          onClick={() => toggleArrayItem('preferredPaymentMethods', method)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer transition-colors ${
                            selected
                              ? 'bg-teal-600 text-white border-teal-600'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {method}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 7: ABOUT THE TUTOR */}
          {/* ========================================================================= */}
          {currentStep === 7 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <FileText className="w-5 h-5 text-teal-600" />
                  <span>Step 7: About the Tutor</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Introduce yourself to parents. Highlight your teaching methodology, strengths, and awards.
                </p>
              </div>

              {/* Headline */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    Professional Profile Headline <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {formData.headline.length}/120 characters
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={120}
                  value={formData.headline}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                  placeholder="e.g. M.Sc. Mathematics | 8+ Yrs Experience CBSE Class 10 & 12 Board Specialist"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:outline-hidden focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                />
              </div>

              {/* About Me / Introduction */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    About Me / Teaching Introduction <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {formData.bio.length} characters (minimum 20)
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Share your passion for education, communication style with parents, and how you adapt your lessons to students of varying aptitude."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                />
              </div>

              {/* Teaching Methodology */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Teaching Methodology & Pedagogy
                </label>
                <textarea
                  rows={3}
                  value={formData.teachingMethodology}
                  onChange={(e) => setFormData({ ...formData, teachingMethodology: e.target.value })}
                  placeholder="e.g. Step-by-step conceptual visualization, chapter-end formula sheets, weekly timed tests, and doubt clearing."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800"
                />
              </div>

              {/* Strengths & Specializations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Strengths and Specializations
                  </label>
                  <textarea
                    rows={2}
                    value={formData.strengthsAndSpecializations}
                    onChange={(e) => setFormData({ ...formData, strengthsAndSpecializations: e.target.value })}
                    placeholder="e.g. CBSE 100/100 scoring strategy, removing math phobia, Olympiad mentoring"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Awards, Certifications or Achievements <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={formData.achievements}
                    onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
                    placeholder="e.g. Best Teacher Award 2024, Published 2 Research Papers, 10+ students in IIT/AIIMS"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 8: DOCUMENTS AND VERIFICATION */}
          {/* ========================================================================= */}
          {currentStep === 8 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-teal-600" />
                  <span>Step 8: Documents and Verification</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Upload verification documents. Files are stored securely and reviewed only by authorized administrators.
                </p>
              </div>

              {/* Notice Banner */}
              <div className="p-4 bg-sky-50 rounded-2xl border border-sky-200 flex items-start gap-3">
                <Info className="w-5 h-5 text-sky-700 shrink-0 mt-0.5" />
                <div className="text-xs text-sky-900 space-y-1">
                  <div className="font-bold">Strict Child & Educator Safety Standard</div>
                  <p className="leading-relaxed">
                    Documents uploaded here (Govt IDs, degrees) are never publicly visible to parents or web crawlers.
                    The official <strong>Degree Verified</strong> badge is awarded only once verified by our team.
                  </p>
                </div>
              </div>

              {/* Upload Action Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* 1. Identity Verification */}
                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-3">
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-teal-600" />
                      <span>Govt Identity Proof</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Aadhaar, PAN card, Voter ID, or Passport (PDF / Image up to 10MB).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTriggerDocUpload('identity')}
                    disabled={uploadingDocType === 'identity'}
                    className="w-full py-2 bg-white border border-slate-300 hover:bg-slate-100 text-xs font-bold text-slate-800 rounded-xl flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingDocType === 'identity' ? 'Uploading...' : 'Upload Govt ID'}</span>
                  </button>
                </div>

                {/* 2. Qualification Certificates */}
                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-3">
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-sky-600" />
                      <span>Degree / Marksheets</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1">
                      University degree, provisional certificate, or CTET certificate.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTriggerDocUpload('qualification')}
                    disabled={uploadingDocType === 'qualification'}
                    className="w-full py-2 bg-white border border-slate-300 hover:bg-slate-100 text-xs font-bold text-slate-800 rounded-xl flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingDocType === 'qualification' ? 'Uploading...' : 'Upload Degree'}</span>
                  </button>
                </div>

                {/* 3. Resume / Other */}
                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-3">
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-indigo-600" />
                      <span>Resume / Supporting</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Updated CV or school recommendation letter.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTriggerDocUpload('resume')}
                    disabled={uploadingDocType === 'resume'}
                    className="w-full py-2 bg-white border border-slate-300 hover:bg-slate-100 text-xs font-bold text-slate-800 rounded-xl flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingDocType === 'resume' ? 'Uploading...' : 'Upload CV / Doc'}</span>
                  </button>
                </div>
              </div>

              {/* Uploaded Documents List */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  Uploaded Confidential Documents ({formData.verificationDocuments.length})
                </h4>

                {formData.verificationDocuments.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    No documents uploaded yet. Document upload is optional for saving drafts, but verified documents earn the "Degree Verified" badge.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-2xl overflow-hidden">
                    {formData.verificationDocuments.map((doc, idx) => (
                      <div key={idx} className="p-4 flex items-center justify-between gap-3 bg-white hover:bg-slate-50/50">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                            <FileCheck className="w-4 h-4 text-teal-600" />
                          </div>
                          <div>
                            <div className="font-bold text-xs text-slate-900">{doc.title || doc.originalName}</div>
                            <div className="text-[10px] text-slate-400 capitalize">
                              Category: {doc.docType} • Uploaded {new Date(doc.uploadedAt || Date.now()).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {(doc._id || doc.path) && (
                            <a
                              href={getDocumentUrl(doc._id || doc.path)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-bold text-teal-700 hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <span>View</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          {doc.status === 'verified' ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                              Verified
                            </span>
                          ) : doc.status === 'rejected' ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 uppercase tracking-wider">
                              Rejected
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 uppercase tracking-wider flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>Pending Review</span>
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 9: REVIEW AND SUBMIT */}
          {/* ========================================================================= */}
          {currentStep === 9 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-teal-600" />
                  <span>Step 9: Review and Submit Profile</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Preview your tutor profile. Click any "Edit" button to adjust your information before publishing.
                </p>
              </div>

              {/* Summary Cards */}
              <div className="space-y-4">
                {/* 1. Personal & Identity Card */}
                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <User className="w-4 h-4 text-teal-600" />
                      <span>1. Personal Details</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleGoToStep(1)}
                      className="text-xs font-bold text-teal-700 hover:underline cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs items-center">
                    <div className="flex items-center gap-3 col-span-1 sm:col-span-1">
                      <div className="w-12 h-12 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold text-sm overflow-hidden shrink-0 shadow-xs ring-2 ring-teal-600/30">
                        {photoPreview ? (
                          <img
                            src={getAvatarUrl(photoPreview)}
                            alt="Tutor"
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        ) : (
                          <span>{formData.fullName?.[0] || user?.name?.[0] || 'T'}</span>
                        )}
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Full Name</span>
                        <span className="font-bold text-slate-800">{formData.fullName || '—'}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Phone</span>
                      <span className="font-bold text-slate-800">{formData.mobileNumber || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Email</span>
                      <span className="font-bold text-slate-800">{formData.email || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Locality</span>
                      <span className="font-bold text-slate-800">{formData.area}, {formData.city}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Education Card */}
                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-teal-600" />
                      <span>2. Education & Qualifications</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleGoToStep(2)}
                      className="text-xs font-bold text-teal-700 hover:underline cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Degree</span>
                      <span className="font-bold text-slate-800">{formData.degreeCourseName || formData.highestQualification || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">College / University</span>
                      <span className="font-bold text-slate-800">{formData.collegeUniversity || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Year</span>
                      <span className="font-bold text-slate-800">{formData.passingYear || '—'}</span>
                    </div>
                  </div>
                </div>

                {/* 3. Teaching Experience Card */}
                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-teal-600" />
                      <span>3. Teaching Experience</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleGoToStep(3)}
                      className="text-xs font-bold text-teal-700 hover:underline cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="text-xs space-y-1">
                    <div>
                      <span className="font-bold text-slate-900">
                        {formData.experienceYears} Years {formData.experienceMonths ? `${formData.experienceMonths} Months` : ''} Total Experience
                      </span>
                      {formData.teachingInstitutions && (
                        <span className="text-slate-500"> ({formData.teachingInstitutions})</span>
                      )}
                    </div>
                    <p className="text-slate-600 italic line-clamp-2">"{formData.experienceDescription}"</p>
                  </div>
                </div>

                {/* 4. Classes, Subjects & Fees Card */}
                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-teal-600" />
                      <span>4. Classes, Subjects & Rates</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleGoToStep(6)}
                      className="text-xs font-bold text-teal-700 hover:underline cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Classes</span>
                      <span className="font-bold text-slate-800">{formData.schoolClassGroups.join(', ') || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Subjects</span>
                      <span className="font-bold text-slate-800">{formData.subjects.join(', ') || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Fee Rates</span>
                      <span className="font-bold text-teal-800">
                        ₹{formData.hourlyFee}/hr
                        {formData.monthlyFee ? ` • ₹${formData.monthlyFee}/mo` : ''}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 8. Uploaded Verification Documents Card */}
                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-teal-600" />
                      <span>8. Confidential Uploaded Documents ({formData.verificationDocuments.length})</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleGoToStep(8)}
                      className="text-xs font-bold text-teal-700 hover:underline cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>
                  {formData.verificationDocuments.length === 0 ? (
                    <div className="text-xs text-slate-400 italic">No verification documents attached yet (optional).</div>
                  ) : (
                    <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-xl overflow-hidden bg-white">
                      {formData.verificationDocuments.map((doc, idx) => (
                        <div key={idx} className="p-3 flex items-center justify-between gap-3 text-xs">
                          <div>
                            <div className="font-bold text-slate-800">{doc.title || doc.originalName || 'Document'}</div>
                            <span className="text-slate-400 capitalize text-[10px]">
                              Type: <strong>{doc.docType}</strong> • Status: {doc.status || 'Pending'}
                            </span>
                          </div>
                          {(doc._id || doc.path) && (
                            <a
                              href={getDocumentUrl(doc._id || doc.path)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold flex items-center gap-1.5 shadow-xs shrink-0 cursor-pointer text-[11px]"
                            >
                              <span>Inspect</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Privacy and Terms Acceptance Checkbox */}
              <div className="p-4 bg-teal-50/60 rounded-2xl border border-teal-200/80 space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.termsAccepted}
                    onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
                    className="mt-1 w-4 h-4 text-teal-600 rounded-sm focus:ring-teal-500"
                  />
                  <div className="text-xs text-slate-800 space-y-0.5">
                    <span className="font-bold block">
                      I confirm that all entered details and documents are authentic.
                    </span>
                    <p className="text-slate-500 text-[11px] leading-relaxed">
                      I agree to ShikshaLink's Tutor Code of Conduct, child safety guidelines, and 10% platform service terms.
                      I understand that residential addresses and student contact numbers remain protected until mutual booking confirmation.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* NAVIGATION BUTTONS (FOOTER) */}
          {/* ========================================================================= */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-5 py-2.5 rounded-2xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
            ) : (
              <div></div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleManualSaveDraft}
                disabled={savingDraft}
                className="px-4 py-2.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4 text-slate-400" />
                <span>Save Draft</span>
              </button>

              {currentStep < TOTAL_STEPS ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-6 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-teal-600/30 transition-all cursor-pointer"
                >
                  <span>Next Step</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmitProfile}
                  disabled={submitting}
                  className="px-8 py-3 rounded-2xl btn-3d-primary text-xs uppercase tracking-wider font-extrabold flex items-center gap-2 cursor-pointer shadow-lg"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Publishing Profile...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Profile</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SUCCESS CONFIRMATION MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 text-center shadow-2xl border border-slate-100">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <Sparkles className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                Profile Published Successfully! 🎉
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your tutor profile is now active on the ShikshaLink marketplace. Parents in <strong>{formData.area}</strong> and Delhi NCR can discover and book tuition sessions with you.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-left text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Search visibility active</span>
              </div>
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Direct session requests enabled</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowSuccessModal(false);
                navigate('/tutor');
              }}
              className="w-full py-3.5 rounded-2xl btn-3d-primary font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg cursor-pointer"
            >
              <span>Go to Tutor Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
