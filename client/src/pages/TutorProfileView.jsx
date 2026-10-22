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
  Share2
} from 'lucide-react';
import { apiRequest } from '../services/api';
import { VerificationBadge, TeachingModeBadge } from '../components/common/Badge';
import { BookingModal } from '../components/bookings/BookingModal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const TutorProfileView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();
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
    const reason = prompt('Please describe your concern or the policy violation:');
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

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Header Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-5">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-sky-700 to-teal-600 text-white font-extrabold text-3xl flex items-center justify-center uppercase shadow-md shrink-0 overflow-hidden">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user.name?.[0] || 'T'
                )}
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    {user.name}
                  </h1>
                  {tutor.reviewCount > 0 && (
                    <span className="flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 border border-amber-200 rounded-full font-bold text-xs text-amber-800">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {tutor.averageRating?.toFixed(1)} ({tutor.reviewCount} reviews)
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium text-slate-600 max-w-xl">
                  {tutor.headline}
                </p>
                <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap pt-1">
                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {tutor.primaryLocality || 'Mayur Vihar, Delhi'}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {tutor.yearsOfExperience || 1}+ Years Teaching Experience
                  </span>
                </div>
              </div>
            </div>

            {/* Price Box & Action Buttons */}
            <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
              <div className="text-left md:text-right">
                <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Tuition Rate</div>
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
                  className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md transition-all"
                >
                  {isFreeDemo ? 'Book Free Demo' : 'Book Session'}
                </button>
              </div>
            </div>
          </div>

          {/* Verification Badges bar */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-2">
              Credentials:
            </span>
            {tutor.verificationBadges?.qualificationVerified && (
              <VerificationBadge type="qualification" />
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
            {/* Bio & Methodology */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-4">
              <h2 className="text-lg font-bold text-slate-900">About the Tutor & Pedagogy</h2>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {tutor.bio || 'Experienced academic tutor committed to helping students achieve conceptual clarity and exam confidence.'}
              </p>

              {tutor.teachingMethodology && (
                <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
                    Teaching Methodology
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {tutor.teachingMethodology}
                  </p>
                </div>
              )}

              {/* Languages & Previous Experience */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 text-xs">
                <div>
                  <span className="font-bold text-slate-700">Languages Taught In:</span>
                  <p className="text-slate-600 mt-0.5">{tutor.teachingLanguages?.join(', ') || 'English, Hindi'}</p>
                </div>
                {tutor.previousExperience && (
                  <div>
                    <span className="font-bold text-slate-700">Previous Experience:</span>
                    <p className="text-slate-600 mt-0.5">{tutor.previousExperience}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Subjects, Classes & Boards */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-4">
              <h2 className="text-lg font-bold text-slate-900">Subjects & Classes Taught</h2>
              
              <div className="space-y-3">
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

                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Boards Covered</div>
                  <div className="flex flex-wrap gap-2">
                    {tutor.boards?.map((b) => (
                      <span key={b} className="px-3 py-1 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold border border-emerald-100">
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Qualifications & Degrees (Verified) */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-4">
              <h2 className="text-lg font-bold text-slate-900">Academic Qualifications</h2>
              {qualifications.length === 0 ? (
                <p className="text-xs text-slate-400">No verified degree records attached.</p>
              ) : (
                <div className="space-y-3">
                  {qualifications.map((q) => (
                    <div key={q._id} className="p-4 rounded-2xl bg-teal-50/40 border border-teal-100 flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <GraduationCap className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-sm text-slate-900">{q.degree}</div>
                          <div className="text-xs text-slate-600">{q.institution} ({q.passingYear})</div>
                          {q.fieldOfStudy && (
                            <div className="text-[11px] text-slate-500 mt-0.5">Specialization: {q.fieldOfStudy}</div>
                          )}
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 uppercase tracking-wider">
                        Verified
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Parent Reviews & Feedback */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Parent Reviews & Feedback</h2>
                  <p className="text-xs text-slate-500">Only from eligible completed bookings</p>
                </div>
                {tutor.reviewCount > 0 && (
                  <div className="text-right">
                    <div className="text-2xl font-black text-amber-700">{tutor.averageRating?.toFixed(1)} ★</div>
                    <div className="text-xs text-slate-400">{tutor.reviewCount} total ratings</div>
                  </div>
                )}
              </div>

              {/* Sub-scores breakdown */}
              {tutor.reviewCount > 0 && (
                <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-center">
                  <div>
                    <div className="text-xs text-slate-500">Teaching Quality</div>
                    <div className="font-bold text-slate-800 text-sm mt-0.5">{tutor.teachingQualityScore?.toFixed(1) || '5.0'} / 5.0</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Punctuality</div>
                    <div className="font-bold text-slate-800 text-sm mt-0.5">{tutor.punctualityScore?.toFixed(1) || '5.0'} / 5.0</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Communication</div>
                    <div className="font-bold text-slate-800 text-sm mt-0.5">{tutor.communicationScore?.toFixed(1) || '5.0'} / 5.0</div>
                  </div>
                </div>
              )}

              {/* Reviews List */}
              {reviews.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl">
                  No written reviews yet for this tutor.
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

                      {/* Tutor response */}
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
            {/* Teaching Modes Supported Card */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-5">
              <h3 className="font-bold text-slate-900 text-base">Teaching Mode Details</h3>

              {/* Online Mode */}
              {tutor.teachingModes?.includes('online') && (
                <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                    <Laptop className="w-4 h-4 text-blue-600" />
                    Online Tuition
                  </div>
                  <p className="text-xs text-blue-800 leading-relaxed">
                    Interactive live classes via Google Meet / Zoom with digital tablet notes.
                  </p>
                </div>
              )}

              {/* Student's Home */}
              {tutor.teachingModes?.includes('student_home') && (
                <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                    <MapPin className="w-4 h-4 text-amber-600" />
                    Home Tuition
                  </div>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    Travels up to {tutor.homeTuitionDetails?.maxTravelDistanceKm || 5} km within Mayur Vihar, Patparganj & neighbouring sectors.
                  </p>
                  <p className="text-[11px] text-amber-700/80">
                    Protected: Student address shared only after booking confirmation.
                  </p>
                </div>
              )}

              {/* Tutor's Centre */}
              {tutor.teachingModes?.includes('tutor_centre') && tutor.centreDetails?.enabled && (
                <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-900">
                    <Building2 className="w-4 h-4 text-purple-600" />
                    Teaching Centre: {tutor.centreDetails.centreName || 'Neighbourhood Centre'}
                  </div>
                  <div className="text-xs text-purple-800">
                    Location: {tutor.centreDetails.locality || tutor.primaryLocality}
                  </div>
                  {tutor.centreDetails.facilities?.length > 0 && (
                    <div className="text-[11px] text-purple-700">
                      Facilities: {tutor.centreDetails.facilities.join(', ')}
                    </div>
                  )}
                  {tutor.centreDetails.batches?.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <div className="text-[11px] font-bold text-purple-900 uppercase">Available Batches:</div>
                      {tutor.centreDetails.batches.map((b, idx) => (
                        <div key={idx} className="p-2 rounded-lg bg-white/80 text-[11px] text-slate-700 border border-purple-100">
                          <div className="font-semibold text-purple-900">{b.batchName}</div>
                          <div>{b.timing} • Cap: {b.capacity} students</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Fee Breakdown Card */}
              <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
                <div className="font-bold text-slate-800">Fee Structure Card</div>
                <div className="flex justify-between py-1 text-slate-600">
                  <span>Hourly Rate:</span>
                  <span className="font-bold text-slate-900">₹{tutor.feeStructure?.hourlyRate || 500}</span>
                </div>
                {tutor.feeStructure?.monthlyRate && (
                  <div className="flex justify-between py-1 text-slate-600">
                    <span>Monthly (approx. 12 classes):</span>
                    <span className="font-bold text-slate-900">₹{tutor.feeStructure?.monthlyRate}</span>
                  </div>
                )}
                {tutor.demoClassAvailable && (
                  <div className="flex justify-between py-1 text-emerald-700 font-semibold">
                    <span>Trial / Demo Session:</span>
                    <span>{isFreeDemo ? 'Free Trial (45 mins)' : `₹${tutor.demoClassFee}`}</span>
                  </div>
                )}
              </div>

              {/* Booking CTA */}
              <button
                onClick={handleBookClick}
                className="w-full py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md transition-all"
              >
                {isFreeDemo ? 'Request Free Demo Class' : 'Request Tuition Session'}
              </button>

              <button
                onClick={handleReportProfile}
                className="w-full text-center text-xs text-slate-400 hover:text-rose-600 flex items-center justify-center gap-1.5 pt-1"
              >
                <Flag className="w-3.5 h-3.5" />
                Report Profile or Discrepancy
              </button>
            </div>
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
