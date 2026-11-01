import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Save,
  Laptop,
  MapPin,
  Building2,
  CheckCircle2,
  DollarSign,
  Camera,
  Upload,
  User,
  GraduationCap,
  BookOpen,
  Code2,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Check,
  AlertCircle
} from 'lucide-react';
import { apiRequest } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

export const TutorProfileEdit = () => {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [selectedPhotoFile, setSelectedPhotoFile] = useState(null);

  // Profile Identity & Headline
  const [professionalTitle, setProfessionalTitle] = useState('');
  const [headline, setHeadline] = useState('');
  const [shortIntro, setShortIntro] = useState('');
  const [qualificationDisplay, setQualificationDisplay] = useState('');
  const [bio, setBio] = useState('');

  // Organisation
  const [orgName, setOrgName] = useState('');
  const [orgRole, setOrgRole] = useState('Founder');
  const [orgFoundedYear, setOrgFoundedYear] = useState(2023);
  const [orgDescription, setOrgDescription] = useState('');

  // Education Details
  const [eduDegree, setEduDegree] = useState('');
  const [eduInstitution, setEduInstitution] = useState('');
  const [eduCampus, setEduCampus] = useState('');
  const [eduStatus, setEduStatus] = useState('Currently pursuing');
  const [eduExpectedYear, setEduExpectedYear] = useState(2027);

  // Methodology & Experience
  const [teachingMethodology, setTeachingMethodology] = useState('');
  const [methodologyListStr, setMethodologyListStr] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState(1);
  const [previousExperience, setPreviousExperience] = useState('');

  // Subjects, Classes, Programming, Languages
  const [subjectsStr, setSubjectsStr] = useState('');
  const [classesStr, setClassesStr] = useState('');
  const [programmingSkillsStr, setProgrammingSkillsStr] = useState('');
  const [languagesStr, setLanguagesStr] = useState('English, Hindi');

  // Service Area Confirmation
  const [serviceLocality, setServiceLocality] = useState('Mayur Vihar Phase 1 / Chilla Village');
  const [serviceCity, setServiceCity] = useState('East Delhi');
  const [isServiceConfirmed, setIsServiceConfirmed] = useState(true);

  // Teaching Modes
  const [teachingModes, setTeachingModes] = useState(['student_home', 'tutor_centre']);

  // Home Tuition Settings
  const [preferredLocalitiesStr, setPreferredLocalitiesStr] = useState('Mayur Vihar Phase 1, Chilla Village, East Delhi');
  const [maxTravelDistanceKm, setMaxTravelDistanceKm] = useState(6);

  // Centre Settings
  const [centreName, setCentreName] = useState('Tech Karma Classes');
  const [centreLocality, setCentreLocality] = useState('Mayur Vihar Phase 1 / Chilla Village');
  const [facilitiesStr, setFacilitiesStr] = useState('Air Conditioned, Whiteboard, Computer Lab Support');

  // Fee Structure
  const [hourlyRate, setHourlyRate] = useState(1000);
  const [monthlyRate, setMonthlyRate] = useState(8000);
  const [groupDiscountPercent, setGroupDiscountPercent] = useState(15);
  const [demoClassAvailable, setDemoClassAvailable] = useState(true);
  const [demoClassFee, setDemoClassFee] = useState(0);

  const [profileId, setProfileId] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiRequest('/tutors/profile/me');
        if (res.success && res.profile) {
          const p = res.profile;
          setProfileId(p._id);
          setProfessionalTitle(p.professionalTitle || '');
          setHeadline(p.headline || '');
          setShortIntro(p.shortIntro || '');
          setQualificationDisplay(p.qualificationDisplay || '');
          setBio(p.bio || '');

          if (p.organisation) {
            setOrgName(p.organisation.name || '');
            setOrgRole(p.organisation.role || 'Founder');
            setOrgFoundedYear(p.organisation.foundedYear || 2023);
            setOrgDescription(p.organisation.description || '');
          }

          if (p.educationDetails) {
            setEduDegree(p.educationDetails.degree || '');
            setEduInstitution(p.educationDetails.institution || '');
            setEduCampus(p.educationDetails.campus || '');
            setEduStatus(p.educationDetails.status || 'Currently pursuing');
            setEduExpectedYear(p.educationDetails.expectedGraduationYear || 2027);
          }

          setTeachingMethodology(p.teachingMethodology || '');
          setMethodologyListStr(p.teachingMethodologyList?.join('\n') || '');
          setYearsOfExperience(p.yearsOfExperience ?? 1);
          setPreviousExperience(p.previousExperience || '');

          setSubjectsStr(p.subjects?.join(', ') || '');
          setClassesStr(p.classes?.join(', ') || '');
          setProgrammingSkillsStr(p.programmingSkills?.join(', ') || '');
          setLanguagesStr(p.teachingLanguages?.join(', ') || 'English, Hindi');

          if (p.serviceArea) {
            setServiceLocality(p.serviceArea.locality || p.primaryLocality || 'Mayur Vihar Phase 1 / Chilla Village');
            setServiceCity(p.serviceArea.city || p.city || 'East Delhi');
            setIsServiceConfirmed(p.serviceArea.isConfirmed ?? true);
          } else {
            setServiceLocality(p.primaryLocality || 'Mayur Vihar Phase 1 / Chilla Village');
            setServiceCity(p.city || 'East Delhi');
          }

          setTeachingModes(p.teachingModes || ['student_home', 'tutor_centre']);
          setPreferredLocalitiesStr(p.homeTuitionDetails?.preferredLocalities?.join(', ') || '');
          setMaxTravelDistanceKm(p.homeTuitionDetails?.maxTravelDistanceKm || 6);

          setCentreName(p.centreDetails?.centreName || 'Tech Karma Classes');
          setCentreLocality(p.centreDetails?.locality || 'Mayur Vihar Phase 1 / Chilla Village');
          setFacilitiesStr(p.centreDetails?.facilities?.join(', ') || '');

          setHourlyRate(p.feeStructure?.hourlyRate || 1000);
          setMonthlyRate(p.feeStructure?.monthlyRate || 8000);
          setGroupDiscountPercent(p.feeStructure?.groupTuitionDiscountPercent || 15);
          setDemoClassAvailable(p.demoClassAvailable ?? true);
          setDemoClassFee(p.demoClassFee || 0);

          if (p.user?.avatar || user?.avatar) {
            setPhotoPreview(p.user?.avatar || user?.avatar);
          }
        }
      } catch (err) {
        showToast('Failed to load profile', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [showToast, user]);

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
      showToast('Please select a valid image file (JPG, PNG, or WebP)', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('File size must be less than 5MB', 'error');
      return;
    }

    setSelectedPhotoFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPhotoPreview(objectUrl);
  };

  const handleUploadPhoto = async () => {
    if (!selectedPhotoFile) {
      fileInputRef.current?.click();
      return;
    }

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('avatar', selectedPhotoFile);

      const res = await apiRequest('/tutors/avatar', {
        method: 'POST',
        body: formData
      });

      if (res.success) {
        showToast('Profile photo updated successfully!', 'success');
        setSelectedPhotoFile(null);
        if (res.avatarUrl) {
          setPhotoPreview(res.avatarUrl);
        }
        await refreshUser();
      }
    } catch (err) {
      showToast(err.message || 'Failed to upload photo', 'error');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const toggleMode = (mode) => {
    setTeachingModes((prev) => {
      if (prev.includes(mode)) {
        if (prev.length === 1) {
          showToast('At least one teaching mode must be enabled.', 'error');
          return prev;
        }
        return prev.filter((m) => m !== mode);
      } else {
        return [...prev, mode];
      }
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    const subjects = subjectsStr.split(',').map((s) => s.trim()).filter(Boolean);
    const classes = classesStr.split(',').map((s) => s.trim()).filter(Boolean);
    const programmingSkills = programmingSkillsStr.split(',').map((s) => s.trim()).filter(Boolean);
    const teachingLanguages = languagesStr.split(',').map((s) => s.trim()).filter(Boolean);
    const preferredLocalities = preferredLocalitiesStr.split(',').map((s) => s.trim()).filter(Boolean);
    const facilities = facilitiesStr.split(',').map((s) => s.trim()).filter(Boolean);
    const teachingMethodologyList = methodologyListStr
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const payload = {
        professionalTitle,
        headline,
        shortIntro,
        qualificationDisplay,
        bio,
        organisation: {
          name: orgName,
          role: orgRole,
          foundedYear: Number(orgFoundedYear) || 2023,
          description: orgDescription
        },
        educationDetails: {
          degree: eduDegree,
          institution: eduInstitution,
          campus: eduCampus,
          status: eduStatus,
          expectedGraduationYear: Number(eduExpectedYear) || 2027
        },
        programmingSkills,
        teachingMethodology,
        teachingMethodologyList,
        yearsOfExperience: Number(yearsOfExperience),
        previousExperience,
        teachingLanguages,
        subjects,
        classes,
        teachingModes,
        serviceArea: {
          locality: serviceLocality,
          city: serviceCity,
          isConfirmed: isServiceConfirmed
        },
        primaryLocality: serviceLocality,
        city: serviceCity,
        homeTuitionDetails: {
          enabled: teachingModes.includes('student_home'),
          preferredLocalities,
          maxTravelDistanceKm: Number(maxTravelDistanceKm)
        },
        centreDetails: {
          enabled: teachingModes.includes('tutor_centre'),
          centreName,
          locality: centreLocality,
          facilities
        },
        feeStructure: {
          hourlyRate: Number(hourlyRate),
          monthlyRate: Number(monthlyRate),
          groupTuitionDiscountPercent: Number(groupDiscountPercent)
        },
        demoClassAvailable,
        demoClassFee: Number(demoClassFee)
      };

      const res = await apiRequest('/tutors/profile/me', {
        method: 'PUT',
        body: JSON.stringify(payload)
      });

      if (res.success) {
        showToast('Profile and settings updated successfully!', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to save profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-400">Loading settings...</div>;
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Profile & Rate Settings</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your personal tutor profile, photo, qualifications, teaching modes, and hourly fees.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {profileId && (
            <Link
              to={`/tutors/${profileId}`}
              className="px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:text-teal-700 font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View Public Profile
            </Link>
          )}

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm flex items-center gap-2 disabled:opacity-50 transition-all"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* 1. Profile Photograph Upload Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 text-xs">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
          <Camera className="w-4 h-4 text-teal-600" />
          Profile Photograph
        </h2>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative w-28 h-28 rounded-2xl bg-gradient-to-tr from-sky-700 to-teal-600 text-white font-extrabold text-3xl flex items-center justify-center uppercase shadow-md overflow-hidden ring-4 ring-slate-100 shrink-0">
            {photoPreview ? (
              <img
                src={photoPreview}
                alt="Profile Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{user?.name?.[0] || 'T'}</span>
            )}
          </div>

          <div className="space-y-2 text-center sm:text-left flex-1">
            <div className="font-bold text-slate-800 text-sm">
              Upload Your Photograph
            </div>
            <p className="text-slate-500 text-xs">
              Upload a clear, high-resolution portrait photograph. Recommended format: JPG, PNG, or WebP. Maximum size: 5MB.
            </p>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoSelect}
              accept="image/jpeg,image/png,image/webp,image/jpg"
              className="hidden"
            />

            <div className="flex items-center justify-center sm:justify-start gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                Select Image File
              </button>

              {selectedPhotoFile && (
                <button
                  type="button"
                  disabled={uploadingPhoto}
                  onClick={handleUploadPhoto}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  {uploadingPhoto ? 'Uploading...' : 'Save & Replace Photo'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Professional Identity & Biography */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 text-xs">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
          <User className="w-4 h-4 text-teal-600" />
          Professional Identity & Bio
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Full Name
            </label>
            <input
              type="text"
              disabled
              value={user?.name || 'Sonu Kumar'}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Professional Title
            </label>
            <input
              type="text"
              required
              value={professionalTitle}
              onChange={(e) => setProfessionalTitle(e.target.value)}
              placeholder="e.g. Private Tutor | Computer Science Student"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Qualification Tag (Card Display)
            </label>
            <input
              type="text"
              value={qualificationDisplay}
              onChange={(e) => setQualificationDisplay(e.target.value)}
              placeholder="e.g. B.Tech CSE (Pursuing, 2027)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Full Profile Headline
            </label>
            <input
              type="text"
              required
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. Private Tutor | Computer Science Student | Founder of Tech Karma Classes"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
            Short Introduction (Shown on Tutor Card)
          </label>
          <input
            type="text"
            value={shortIntro}
            onChange={(e) => setShortIntro(e.target.value)}
            placeholder="e.g. Concept-focused teaching, regular practice, doubt-solving, and exam preparation."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
            About Me / Detailed Biography
          </label>
          <textarea
            rows={5}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Introduce yourself, your academic background, teaching goals, and methodology..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 leading-relaxed font-sans"
          />
        </div>
      </div>

      {/* 3. Organisation & Education Details */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 text-xs">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-teal-600" />
          Education & Teaching Organisation
        </h2>

        {/* Education Details */}
        <div className="p-4 rounded-2xl bg-teal-50/40 border border-teal-100 space-y-3">
          <div className="font-bold text-teal-900">Education Details</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Degree / Course</label>
              <input
                type="text"
                value={eduDegree}
                onChange={(e) => setEduDegree(e.target.value)}
                placeholder="e.g. B.Tech in Computer Science and Engineering"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">University / Institution</label>
              <input
                type="text"
                value={eduInstitution}
                onChange={(e) => setEduInstitution(e.target.value)}
                placeholder="e.g. Delhi Skill and Entrepreneurship University (DSEU)"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Campus</label>
              <input
                type="text"
                value={eduCampus}
                onChange={(e) => setEduCampus(e.target.value)}
                placeholder="e.g. Okhla-II Campus"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Status & Expected Graduation</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={eduStatus}
                  onChange={(e) => setEduStatus(e.target.value)}
                  placeholder="e.g. Currently pursuing"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                />
                <input
                  type="number"
                  value={eduExpectedYear}
                  onChange={(e) => setEduExpectedYear(e.target.value)}
                  placeholder="e.g. 2027"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Organisation Details */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="font-bold text-slate-900">Teaching Organisation Founded</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Organisation Name</label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="e.g. Tech Karma Classes"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Role / Position</label>
              <input
                type="text"
                value={orgRole}
                onChange={(e) => setOrgRole(e.target.value)}
                placeholder="e.g. Founder"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Founded Year</label>
              <input
                type="number"
                value={orgFoundedYear}
                onChange={(e) => setOrgFoundedYear(e.target.value)}
                placeholder="e.g. 2023"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Subjects, Classes, Programming & Languages */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 text-xs">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-teal-600" />
          Subjects, Programming & Classes Taught
        </h2>

        <div>
          <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
            Main Academic Subjects (comma-separated)
          </label>
          <input
            type="text"
            required
            value={subjectsStr}
            onChange={(e) => setSubjectsStr(e.target.value)}
            placeholder="e.g. Mathematics, Science, Computer Science, History, Geography, Political Science, English"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
            Programming & Technical Skills (comma-separated)
          </label>
          <input
            type="text"
            value={programmingSkillsStr}
            onChange={(e) => setProgrammingSkillsStr(e.target.value)}
            placeholder="e.g. Python, C++, Java, Web Development, AI/ML Fundamentals"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Classes & Grade Levels (comma-separated)
            </label>
            <input
              type="text"
              required
              value={classesStr}
              onChange={(e) => setClassesStr(e.target.value)}
              placeholder="e.g. Classes 1–5, Classes 6–8, Classes 9–10, Classes 11–12, College / Programming"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Languages Taught In (comma-separated)
            </label>
            <input
              type="text"
              value={languagesStr}
              onChange={(e) => setLanguagesStr(e.target.value)}
              placeholder="e.g. English, Hindi, Sanskrit"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
            Teaching Methodology Points (One bullet per line)
          </label>
          <textarea
            rows={4}
            value={methodologyListStr}
            onChange={(e) => setMethodologyListStr(e.target.value)}
            placeholder="Concept-based learning&#10;Step-by-step explanations&#10;Practical examples&#10;Individual doubt-solving&#10;Regular practice and revision&#10;Syllabus-oriented examination preparation"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium leading-relaxed"
          />
        </div>
      </div>

      {/* 5. Service Area & Location Confirmation */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 text-xs">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-teal-600" />
          Confirmed Service Area & Localities
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Primary Locality / Neighbourhood
            </label>
            <input
              type="text"
              required
              value={serviceLocality}
              onChange={(e) => setServiceLocality(e.target.value)}
              placeholder="e.g. Mayur Vihar Phase 1 / Chilla Village"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              City / Region
            </label>
            <input
              type="text"
              required
              value={serviceCity}
              onChange={(e) => setServiceCity(e.target.value)}
              placeholder="e.g. East Delhi"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer pt-1">
          <input
            type="checkbox"
            checked={isServiceConfirmed}
            onChange={(e) => setIsServiceConfirmed(e.target.checked)}
            className="w-4 h-4 text-teal-600 rounded"
          />
          <span>Confirm service availability in Mayur Vihar Phase 1 / Chilla Village, East Delhi</span>
        </label>
      </div>

      {/* 6. Teaching Modes Supported */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 text-xs">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
          Teaching Modes Supported
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: 'student_home', label: "Student's Home Tuition", icon: MapPin },
            { id: 'tutor_centre', label: "Tutor's Centre", icon: Building2 },
            { id: 'online', label: 'Online Tuition', icon: Laptop }
          ].map((m) => {
            const isSelected = teachingModes.includes(m.id);
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => toggleMode(m.id)}
                className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  isSelected
                    ? 'border-teal-600 bg-teal-50 text-teal-900 font-bold shadow-2xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <m.icon className={`w-5 h-5 ${isSelected ? 'text-teal-700' : 'text-slate-400'}`} />
                  <span>{m.label}</span>
                </div>
                {isSelected && <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Home Tuition Specific Config */}
        {teachingModes.includes('student_home') && (
          <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80 space-y-3 mt-3">
            <div className="font-bold text-amber-900">Home Tuition Coverage Settings</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Preferred Localities in East Delhi
                </label>
                <input
                  type="text"
                  value={preferredLocalitiesStr}
                  onChange={(e) => setPreferredLocalitiesStr(e.target.value)}
                  placeholder="e.g. Mayur Vihar Phase 1, Chilla Village, East Delhi"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Max Travel Distance (km)
                </label>
                <input
                  type="number"
                  value={maxTravelDistanceKm}
                  onChange={(e) => setMaxTravelDistanceKm(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tutor's Centre Specific Config */}
        {teachingModes.includes('tutor_centre') && (
          <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-200/80 space-y-3 mt-3">
            <div className="font-bold text-purple-900">Teaching Centre Information</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Centre Name</label>
                <input
                  type="text"
                  value={centreName}
                  onChange={(e) => setCentreName(e.target.value)}
                  placeholder="e.g. Tech Karma Classes"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Centre Locality</label>
                <input
                  type="text"
                  value={centreLocality}
                  onChange={(e) => setCentreLocality(e.target.value)}
                  placeholder="e.g. Mayur Vihar Phase 1 / Chilla Village"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Facilities Provided</label>
              <input
                type="text"
                value={facilitiesStr}
                onChange={(e) => setFacilitiesStr(e.target.value)}
                placeholder="e.g. Air Conditioned, Whiteboard, Computer Lab Support"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
              />
            </div>
          </div>
        )}
      </div>

      {/* 7. Fee Structure & Availability */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 text-xs">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-teal-600" />
          Fee Structure & Pricing Options
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Hourly Tuition Rate (₹ / hour)
            </label>
            <input
              type="number"
              min={100}
              required
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-900"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Monthly Package Rate (₹ / month)
            </label>
            <input
              type="number"
              min={500}
              value={monthlyRate}
              onChange={(e) => setMonthlyRate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-900"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Group Tuition Discount (%)
            </label>
            <input
              type="number"
              min={0}
              max={50}
              value={groupDiscountPercent}
              onChange={(e) => setGroupDiscountPercent(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-900"
            />
          </div>
        </div>

        <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl space-y-3">
          <label className="flex items-center gap-2 font-bold text-teal-950 cursor-pointer">
            <input
              type="checkbox"
              checked={demoClassAvailable}
              onChange={(e) => setDemoClassAvailable(e.target.checked)}
              className="w-4 h-4 text-teal-600 rounded"
            />
            <span>Offer a Trial / Demo Class to Parents</span>
          </label>

          {demoClassAvailable && (
            <div className="flex items-center gap-3 pt-1">
              <span className="text-slate-600 font-semibold">Demo Class Fee:</span>
              <button
                type="button"
                onClick={() => setDemoClassFee(0)}
                className={`px-3 py-1 rounded-lg border font-bold ${
                  demoClassFee === 0
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white border-slate-300 text-slate-700'
                }`}
              >
                Free Trial (3 Days / 45 Mins)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 8. Qualifications & Document Verification Link */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-3 text-xs">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              Degrees & Document Verification
            </h2>
            <p className="text-slate-500 text-xs mt-0.5">
              Upload your degree certificates and government ID documents to earn verified trust badges.
            </p>
          </div>
          <Link
            to="/tutor/qualifications"
            className="px-4 py-2 rounded-xl bg-teal-50 text-teal-800 border border-teal-200 font-bold text-xs hover:bg-teal-100 transition-all flex items-center gap-1.5 shrink-0"
          >
            Manage Documents
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={saving}
          className="px-8 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md flex items-center gap-2 disabled:opacity-50 transition-all"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </form>
  );
};
