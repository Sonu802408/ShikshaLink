import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  PlusCircle,
  PauseCircle,
  PlayCircle,
  XCircle,
  Users,
  Sparkles,
  MapPin,
  ChevronRight,
  Star
} from 'lucide-react';
import { apiRequest } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { TutorCard } from '../../components/tutors/TutorCard';
import { BookingModal } from '../../components/bookings/BookingModal';

export const MyRequirements = () => {
  const { showToast } = useToast();
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected requirement for viewing matched tutors
  const [selectedReq, setSelectedReq] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(false);

  // Booking Modal
  const [selectedTutorForBooking, setSelectedTutorForBooking] = useState(null);

  const fetchRequirements = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/requirements/my');
      if (data.success) {
        setRequirements(data.requirements || []);
      }
    } catch (err) {
      showToast('Failed to load requirements', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequirements();
  }, []);

  const handleViewMatches = async (reqItem) => {
    setSelectedReq(reqItem);
    setLoadingMatches(true);
    try {
      const data = await apiRequest(`/requirements/${reqItem._id}`);
      if (data.success) {
        setMatches(data.matches || []);
      }
    } catch (err) {
      showToast('Failed to load matched tutors', 'error');
    } finally {
      setLoadingMatches(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await apiRequest(`/requirements/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      if (res.success) {
        showToast(`Requirement status changed to ${newStatus}`, 'success');
        setRequirements((prev) =>
          prev.map((r) => (r._id === id ? { ...r, status: newStatus } : r))
        );
      }
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">My Tuition Requirements</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Active tuition posts evaluated by our tutor matching engine
          </p>
        </div>
        <Link
          to="/parent/requirements/new"
          className="px-4 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          Post New
        </Link>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-400">Loading your requirements...</div>
      ) : requirements.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">No tuition requirements posted</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Create a requirement with your child's grade and subjects to let matched teachers find you.
          </p>
          <Link
            to="/parent/requirements/new"
            className="inline-block px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
          >
            Create First Requirement
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {requirements.map((reqItem) => (
            <div
              key={reqItem._id}
              className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-2xs"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-base">{reqItem.title || 'Tuition Requirement'}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      reqItem.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : reqItem.status === 'paused'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {reqItem.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                    <span>Student: {reqItem.child?.displayName || 'Child'}</span>
                    <span>Mode: <strong className="capitalize text-slate-700">{reqItem.teachingMode?.replace('_', ' ')}</strong></span>
                    <span>Locality: {reqItem.location?.locality}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleViewMatches(reqItem)}
                    className="px-3.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                    View Matched Tutors
                  </button>

                  {reqItem.status === 'active' ? (
                    <button
                      onClick={() => handleUpdateStatus(reqItem._id, 'paused')}
                      className="p-1.5 rounded-lg border text-slate-500 hover:text-amber-600 hover:bg-amber-50"
                      title="Pause applications"
                    >
                      <PauseCircle className="w-4 h-4" />
                    </button>
                  ) : reqItem.status === 'paused' ? (
                    <button
                      onClick={() => handleUpdateStatus(reqItem._id, 'active')}
                      className="p-1.5 rounded-lg border text-slate-500 hover:text-emerald-600 hover:bg-emerald-50"
                      title="Resume"
                    >
                      <PlayCircle className="w-4 h-4" />
                    </button>
                  ) : null}

                  {reqItem.status !== 'closed' && (
                    <button
                      onClick={() => handleUpdateStatus(reqItem._id, 'closed')}
                      className="p-1.5 rounded-lg border text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                      title="Close requirement"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Requirement Summary Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-600">
                <div className="bg-slate-50 p-2.5 rounded-xl">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Schedule</div>
                  <div className="font-semibold text-slate-800">{reqItem.schedule?.classesPerWeek || 3} classes/wk</div>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Budget Limit</div>
                  <div className="font-semibold text-slate-800">Up to ₹{reqItem.budget?.maxBudget} / {reqItem.budget?.budgetType}</div>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Language</div>
                  <div className="font-semibold text-slate-800">{reqItem.preferredLanguage || 'English & Hindi'}</div>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Min Experience</div>
                  <div className="font-semibold text-slate-800">{reqItem.tutorPreferences?.minExperienceYears || 1}+ Years</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Matched Tutors Drawer / Modal */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">
                  Matching Engine Results
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  Tutors Matched for: {selectedReq.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedReq(null)}
                className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-400"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              {loadingMatches ? (
                <div className="p-8 text-center text-xs text-slate-400">Running compatibility algorithm...</div>
              ) : matches.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  No tutors currently meet all hard requirements (subject, class, and teaching mode). Try expanding your locality or teaching modes.
                </div>
              ) : (
                <div className="space-y-4">
                  {matches.map(({ tutor, compatibilityScore, budgetMismatch, matchFactors }) => (
                    <div
                      key={tutor._id}
                      className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-teal-500 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center uppercase shrink-0">
                          {tutor.user?.name?.[0] || 'T'}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">{tutor.user?.name}</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-50 text-teal-800 border border-teal-200">
                              {compatibilityScore}% Match
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-1">{tutor.headline}</p>

                          {/* Match Factors Explanations */}
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {matchFactors.map((mf, idx) => (
                              <span
                                key={idx}
                                className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                                  mf.includes('exceeds')
                                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {mf}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <div className="text-right mr-2 hidden sm:block">
                          <div className="font-black text-slate-900 text-sm">
                            ₹{tutor.feeStructure?.hourlyRate || 500}/hr
                          </div>
                          {budgetMismatch && (
                            <span className="text-[10px] text-amber-700 font-bold">Above Budget</span>
                          )}
                        </div>

                        <Link
                          to={`/tutors/${tutor._id}`}
                          className="px-3 py-1.5 text-xs font-bold text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50"
                        >
                          Profile
                        </Link>
                        <button
                          onClick={() => {
                            setSelectedReq(null);
                            setSelectedTutorForBooking(tutor);
                          }}
                          className="px-4 py-1.5 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-xs"
                        >
                          Book Session
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {selectedTutorForBooking && (
        <BookingModal
          tutor={selectedTutorForBooking}
          onClose={() => setSelectedTutorForBooking(null)}
          onBookingSuccess={() => setSelectedTutorForBooking(null)}
        />
      )}
    </div>
  );
};
