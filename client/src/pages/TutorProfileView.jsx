import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  MapPin,
  Clock,
  Award,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Building2,
  Laptop,
  GraduationCap,
  MessageSquare,
  Sparkles,
  Heart,
  Flag,
  Share2,
  Code2,
  Globe,
  BookOpen,
  ArrowLeft,
  Check,
  Info,
  Edit3
} from 'lucide-react';
import { apiRequest } from '../services/api';
import { VerificationBadge, TeachingModeBadge } from '../components/common/Badge';
import { BookingModal } from '../components/bookings/BookingModal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const TutorProfileView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated, role } = useAuth();
  const { showToast } = useToast();

  const [tutor, setTutor] = useState(null);
  const [qualifications, setQualifications] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const fetchTutor = async () => {
      setLoading(true);
      try {
        const res = await apiRequest(`/tutors/${id}/public`);
        if (res.success && res.tutor) {
          setTutor(res.tutor);
          setQualifications(res.qualifications || []);
          setReviews(res.reviews || []);
        }
      } catch (err) {
        showToast('Tutor profile not found', 'error');
        navigate('/find-tutors');
      } finally {
        setLoading(false);
      }
    };
    fetchTutor();
  }, [id, navigate, showToast]);

  const handleBookClick = () => {
    if (!isAuthenticated) {
      showToast('Please sign in or create a parent account to book.', 'info');
      navigate('/login');
      return;
    }
    if (role === 'tutor') {
      showToast('Tutor accounts cannot book other tutors.', 'info');
      return;
    }
    setBookingModalOpen(true);
  };

  const handleSaveTutor = async () => {
    if (!isAuthenticated || role !== 'parent') {
      showToast('Please sign in as a parent to save tutors.', 'info');
      return;
    }
    try {
      const res = await apiRequest('/support/save-tutor', {
        method: 'POST',
        body: JSON.stringify({ tutorProfileId: tutor._id })
      });
      if (res.success) {
        setIsSaved(res.isSaved);
        showToast(res.message, 'success');
      }
    } catch (err) {
      showToast('Failed to save tutor', 'error');
    }
  };

  const handleReportProfile = async () => {
    if (!isAuthenticated) {
      showToast('Please log in to report a profile.', 'info');
      return;
    }
    const reason = prompt('Please describe your concern or policy violation:');
    if (!reason) return;

    try {
      await apiRequest('/support/tickets', {
        method: 'POST',
        body: JSON.stringify({
          ticketType: 'complaint',
          subject: `Report against Tutor: ${tutor.user?.name}`,
          description: reason
        })
      });
      showToast('Report submitted for administrator review.', 'success');
    } catch (err) {
      showToast('Failed to submit report', 'error');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${tutor?.user?.name || 'Tutor'} Profile - ShikshaLink`,
        text: `Check out ${tutor?.user?.name}'s tutor profile on ShikshaLink`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Profile link copied to clipboard!', 'success');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!tutor) return null;

  const user = tutor.user || {};
  const fee = tutor.feeStructure?.hourlyRate || 500;
  const isFreeDemo = tutor.demoClassAvailable && tutor.demoClassFee === 0;
  const isOwnProfile = currentUser && user._id && String(currentUser._id || currentUser.id) === String(user._id);

  const professionalTitle = tutor.professionalTitle || tutor.headline || 'Dedicated Academic Tutor';
  const qualificationDisplay = tutor.qualificationDisplay || (tutor.educationDetails?.degree ? `${tutor.educationDetails.degree}` : null);
  const serviceArea = tutor.serviceArea?.locality || tutor.primaryLocality || 'East Delhi';
  const languages = tutor.teachingLanguages?.join(', ') || 'English, Hindi';

  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to="/find-tutors"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-teal-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Tutors
          </Link>

          <div className="flex items-center gap-2">
            {isOwnProfile && (
              <Link
                to="/tutor/profile"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 text-teal-700 border border-teal-200 text-xs font-bold hover:bg-teal-100 transition-all"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit Profile Settings
              </Link>
            )}
            <button
              onClick={handleShare}
              className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-white hover:text-slate-900 transition-all text-xs flex items-center gap-1"
              title="Share profile link"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </div>

        {/* Section A: Profile Header */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-5">
              <div className="w-22 h-22 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-tr from-sky-700 to-teal-600 text-white font-extrabold text-3xl flex items-center justify-center uppercase shadow-md shrink-0 overflow-hidden ring-4 ring-slate-100">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <span>{user.name?.[0] || 'T'}</span>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    {user.name}
                  </h1>
                  {tutor.reviewCount > 0 ? (
                    <span className="flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 border border-amber-200 rounded-full font-bold text-xs text-amber-800">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {tutor.averageRating?.toFixed(1)} ({tutor.reviewCount} reviews)
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold">
                      New Tutor • No reviews yet
                    </span>
                  )}
                </div>

                <p className="text-sm font-semibold text-teal-800">
                  {professionalTitle}
                </p>

                {qualificationDisplay && (
                  <p className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span>{qualificationDisplay}</span>
                  </p>
                )}

                {tutor.organisation?.name && (
                  <p className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{tutor.organisation.role || 'Founder'}, {tutor.organisation.name}</span>
                    {tutor.organisation.foundedYear && (
                      <span className="text-slate-400">(Est. {tutor.organisation.foundedYear})</span>
                    )}
                  </p>
                )}

                <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap pt-1">
                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {serviceArea}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-slate-600">
                    <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {languages}
                  </span>
                </div>
              </div>
            </div>

            {/* Price Box & Action Buttons */}
            <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
              <div className="text-left md:text-right">
                <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Hourly Tuition Fee</div>
                <div className="text-2xl font-black text-slate-900">
                  ₹{fee}<span className="text-xs font-normal text-slate-500">/hr</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveTutor}
                  className={`p-2.5 rounded-xl border transition-colors ${
                    isSaved ? 'bg-rose-50 border-rose-200 text-rose-600' : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                  title="Save tutor"
                >
                  <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-500' : ''}`} />
                </button>
                <button
                  onClick={handleBookClick}
                  className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md transition-all whitespace-nowrap"
                >
                  Book Tutor
                </button>
              </div>
            </div>
          </div>

          {/* Verification Badges bar */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-2">
              Verification Status:
            </span>
            {tutor.verificationBadges?.qualificationVerified ? (
              <VerificationBadge type="qualification" />
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200" title="Audited documents under review">
                <Info className="w-3 h-3 text-slate-500" />
                Audited Docs Under Verification
              </span>
            )}
            {tutor.verificationBadges?.backgroundChecked && (
              <VerificationBadge type="background" />
            )}
            {tutor.verificationBadges?.idDocumentVerified && (
              <VerificationBadge type="id" />
            )}
            <VerificationBadge type="contact" />
          </div>
        </div>

        {/* 2-Column Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Column (2 spans) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Section B: About Me */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-teal-600" />
                About Me
              </h2>
              <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line space-y-3">
                {tutor.bio || 'Experienced academic tutor committed to helping students achieve conceptual clarity and exam confidence.'}
              </div>
            </div>

            {/* Section C: Education */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-teal-600" />
                Education & Qualifications
              </h2>
              
              {/* Primary Education Details */}
              {tutor.educationDetails?.degree ? (
                <div className="p-4 sm:p-5 rounded-2xl bg-teal-50/50 border border-teal-100 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-bold text-base text-slate-900">
                        {tutor.educationDetails.degree}
                      </div>
                      <div className="text-xs text-slate-700 font-medium mt-0.5">
                        {tutor.educationDetails.institution}
                        {tutor.educationDetails.campus && ` (${tutor.educationDetails.campus})`}
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-teal-100 text-teal-800 shrink-0">
                      {tutor.educationDetails.status || 'Pursuing'}
                    </span>
                  </div>
                  {tutor.educationDetails.expectedGraduationYear && (
                    <div className="text-xs text-slate-600 flex items-center gap-1.5 pt-1">
                      <Clock className="w-3.5 h-3.5 text-teal-600" />
                      <span>Expected Graduation: {tutor.educationDetails.expectedGraduationYear}</span>
                    </div>
                  )}
                </div>
              ) : null}

              {/* Verified Qualification Records */}
              {qualifications.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Verified Certificates & Degrees
                  </div>
                  {qualifications.map((q) => (
                    <div key={q._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3">
                      <div>
                        <div className="font-bold text-sm text-slate-900">{q.degree}</div>
                        <div className="text-xs text-slate-600">{q.institution} ({q.passingYear})</div>
                        {q.fieldOfStudy && (
                          <div className="text-[11px] text-slate-500 mt-0.5">Specialization: {q.fieldOfStudy}</div>
                        )}
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 uppercase tracking-wider">
                        Verified
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section D: Classes and Subjects */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-teal-600" />
                  Classes & Subjects Taught
                </h2>
                <span className="text-xs text-slate-500">Structured Curriculum</span>
              </div>

              {/* Structured Class-Subject Mapping (Sonu Kumar profile structure) */}
              {tutor.classSubjectMapping && tutor.classSubjectMapping.length > 0 ? (
                <div className="space-y-3">
                  {tutor.classSubjectMapping.map((item, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                          {item.classGroup}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {item.subjects?.length} subjects
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {item.subjects?.map((sub) => (
                          <span
                            key={sub}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${
                              item.classGroup.includes('College') || item.classGroup.includes('Programming')
                                ? 'bg-teal-50 text-teal-800 border-teal-200/60'
                                : 'bg-white text-slate-700 border-slate-200'
                            }`}
                          >
                            {sub}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Fallback standard view */
                <div className="space-y-4">
                  <div>
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Subjects</div>
                    <div className="flex flex-wrap gap-2">
                      {tutor.subjects?.map((sub) => (
                        <span key={sub} className="px-3 py-1 bg-slate-100 rounded-xl text-xs font-semibold text-slate-800">
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Classes & Levels</div>
                    <div className="flex flex-wrap gap-2">
                      {tutor.classes?.map((cl) => (
                        <span key={cl} className="px-3 py-1 bg-sky-50 text-sky-800 rounded-xl text-xs font-semibold border border-sky-100">
                          {cl}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Programming Skills Pill Grid */}
              {tutor.programmingSkills && tutor.programmingSkills.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                    <Code2 className="w-4 h-4 text-teal-600" />
                    Programming & Technical Skills
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tutor.programmingSkills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 bg-teal-50 text-teal-900 border border-teal-200/80 rounded-xl text-xs font-semibold"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Section E: Teaching Methodology */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-teal-600" />
                Teaching Methodology & Approach
              </h2>

              {tutor.teachingMethodologyList && tutor.teachingMethodologyList.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {tutor.teachingMethodologyList.map((method, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-teal-50/40 border border-teal-100 flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      <span className="text-xs font-medium text-slate-800 leading-relaxed">
                        {method}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  {tutor.teachingMethodology || 'Concept-focused teaching, regular practice, doubt-solving, and exam preparation.'}
                </p>
              )}
            </div>

            {/* Section F: Teaching Experience */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-teal-600" />
                Teaching Experience & Organisation
              </h2>

              {tutor.organisation?.name && (
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">
                      {tutor.organisation.name}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[11px] font-bold">
                      {tutor.organisation.role || 'Founder'} (Est. {tutor.organisation.foundedYear || 2023})
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {tutor.organisation.description || tutor.previousExperience || 'Founder and academic educator involved in private tutoring and conceptual teaching.'}
                  </p>
                </div>
              )}

              {tutor.experienceDetails?.responsibilities && (
                <div className="text-xs text-slate-600 leading-relaxed pt-1">
                  <span className="font-bold text-slate-700 block mb-1">Key Responsibilities & Focus:</span>
                  <p>{tutor.experienceDetails.responsibilities}</p>
                </div>
              )}
            </div>

            {/* Section I: Student Reviews & Ratings */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-500" />
                    Student Reviews & Feedback
                  </h2>
                  <p className="text-xs text-slate-500">Authentic reviews only from completed tuition bookings</p>
                </div>

                {tutor.reviewCount > 0 && (
                  <div className="text-right">
                    <div className="text-2xl font-black text-amber-700">{tutor.averageRating?.toFixed(1)} ★</div>
                    <div className="text-xs text-slate-400">{tutor.reviewCount} verified reviews</div>
                  </div>
                )}
              </div>

              {/* Authentic Empty or List State */}
              {reviews.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center mx-auto font-bold text-base">
                    ★
                  </div>
                  <div className="font-bold text-slate-800 text-sm">No reviews yet</div>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    New to ShikshaLink — reviews and parent ratings appear authentically only after completed tuition sessions.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 divide-y divide-slate-100">
                  {reviews.map((r) => (
                    <div key={r._id} className="pt-4 first:pt-0 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-slate-800">{r.parentUser?.name || 'Verified Parent'}</div>
                        <div className="flex items-center gap-1 font-bold text-amber-700">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{r.overallRating}.0</span>
                        </div>
                      </div>
                      <p className="text-slate-600 leading-relaxed italic">
                        "{r.feedbackText}"
                      </p>
                      {r.tutorReply?.text && (
                        <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-100 text-[11px] text-teal-950 mt-2">
                          <span className="font-bold">Tutor Reply:</span> {r.tutorReply.text}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right Sidebar: Teaching Mode Details, Schedule & Pricing Card */}
          <div className="space-y-6">
            
            {/* Section G: Teaching Modes and Location */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-5">
              <h3 className="font-bold text-slate-900 text-base">Teaching Modes & Location</h3>

              {/* Student's Home Tuition */}
              {tutor.teachingModes?.includes('student_home') && (
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-950">
                    <MapPin className="w-4 h-4 text-amber-600" />
                    Home Tuition
                  </div>
                  <div className="text-xs text-amber-900 font-medium">
                    Service Area: {tutor.homeTuitionDetails?.preferredLocalities?.join(', ') || serviceArea}
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    Available for home visits up to {tutor.homeTuitionDetails?.maxTravelDistanceKm || 6} km in East Delhi.
                  </p>
                </div>
              )}

              {/* Tutor's Centre */}
              {tutor.teachingModes?.includes('tutor_centre') && (
                <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-950">
                    <Building2 className="w-4 h-4 text-purple-600" />
                    Tutor's Centre: {tutor.centreDetails?.centreName || 'Tech Karma Classes'}
                  </div>
                  <div className="text-xs text-purple-900 font-medium">
                    Locality: {tutor.centreDetails?.locality || serviceArea}
                  </div>
                  {tutor.centreDetails?.facilities?.length > 0 && (
                    <div className="text-[11px] text-purple-800">
                      Facilities: {tutor.centreDetails.facilities.join(', ')}
                    </div>
                  )}
                </div>
              )}

              {/* Online Mode */}
              {tutor.teachingModes?.includes('online') && (
                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-950">
                    <Laptop className="w-4 h-4 text-blue-600" />
                    Online Tuition
                  </div>
                  <p className="text-xs text-blue-900 leading-relaxed">
                    Interactive live classes with digital whiteboard & notes.
                  </p>
                </div>
              )}

              {/* Privacy Note */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 leading-relaxed flex items-start gap-2">
                <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Safety & Privacy:</strong> Exact residential or centre addresses are shared only upon confirmed booking.
                </span>
              </div>

              {/* Section H: Fees and Availability */}
              <div className="pt-3 border-t border-slate-100 space-y-3 text-xs">
                <div className="font-bold text-slate-900 text-sm">Fees & Pricing Structure</div>
                
                <div className="flex justify-between py-1 text-slate-600">
                  <span>Hourly Tuition Fee:</span>
                  <span className="font-bold text-slate-900 text-sm">₹{fee}/hr</span>
                </div>

                {tutor.feeStructure?.monthlyRate && (
                  <div className="flex justify-between py-1 text-slate-600">
                    <span>Monthly (approx. 8–12 sessions):</span>
                    <span className="font-bold text-slate-900">₹{tutor.feeStructure.monthlyRate}</span>
                  </div>
                )}

                {tutor.feeStructure?.groupTuitionDiscountPercent && (
                  <div className="flex justify-between py-1 text-teal-700 font-medium">
                    <span>Group Tuition Discount:</span>
                    <span>{tutor.feeStructure.groupTuitionDiscountPercent}% off</span>
                  </div>
                )}

                <div className="p-2.5 rounded-lg bg-teal-50/60 text-teal-900 text-[11px] leading-relaxed border border-teal-100">
                  Available days and slots, batch-based centre fees, and custom monthly package rates can be set and coordinated in profile settings.
                </div>
              </div>

              {/* Booking Action */}
              <button
                onClick={handleBookClick}
                className="w-full py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md transition-all text-center"
              >
                Book Tutor
              </button>

              <button
                onClick={handleReportProfile}
                className="w-full text-center text-xs text-slate-400 hover:text-rose-600 flex items-center justify-center gap-1.5 pt-1 transition-colors"
              >
                <Flag className="w-3.5 h-3.5" />
                Report Profile or Discrepancy
              </button>
            </div>

            {/* Profile Management Quick card if this is the logged in tutor */}
            {isOwnProfile && (
              <div className="bg-gradient-to-br from-teal-50 to-sky-50 rounded-3xl border border-teal-200 p-6 space-y-3">
                <div className="flex items-center gap-2 font-bold text-teal-950 text-sm">
                  <Edit3 className="w-4 h-4 text-teal-700" />
                  Your Profile Management
                </div>
                <p className="text-xs text-teal-800 leading-relaxed">
                  You are viewing your own public tutor profile. You can edit your bio, upload/replace your profile photo, manage classes, and adjust rates at any time.
                </p>
                <Link
                  to="/tutor/profile"
                  className="block w-full py-2.5 text-center rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-sm transition-all"
                >
                  Go to Profile Settings & Photo Upload
                </Link>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Booking Modal */}
      {bookingModalOpen && (
        <BookingModal
          tutor={tutor}
          onClose={() => setBookingModalOpen(false)}
          onBookingSuccess={() => setBookingModalOpen(false)}
        />
      )}
    </div>
  );
};
