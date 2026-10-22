import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  SlidersHorizontal,
  X,
  RotateCcw,
  Sparkles,
  Award,
  Layers,
  ArrowUpDown
} from 'lucide-react';
import { apiRequest } from '../services/api';
import { TutorCard } from '../components/tutors/TutorCard';
import { TutorComparisonModal } from '../components/tutors/TutorComparisonModal';
import { BookingModal } from '../components/bookings/BookingModal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const FindTutors = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();
  const { showToast } = useToast();

  // Filters State
  const [teachingMode, setTeachingMode] = useState(searchParams.get('mode') || '');
  const [subject, setSubject] = useState(searchParams.get('subject') || '');
  const [classGrade, setClassGrade] = useState(searchParams.get('classGrade') || '');
  const [locality, setLocality] = useState(searchParams.get('locality') || '');
  const [minFee, setMinFee] = useState(searchParams.get('minFee') || '');
  const [maxFee, setMaxFee] = useState(searchParams.get('maxFee') || '');
  const [minExp, setMinExp] = useState(searchParams.get('minExp') || '');
  const [verifiedOnly, setVerifiedOnly] = useState(searchParams.get('verifiedOnly') === 'true');
  const [demoAvailable, setDemoAvailable] = useState(searchParams.get('demoAvailable') === 'true');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'best_match');
  const [page, setPage] = useState(1);

  // Results & Loading
  const [tutors, setTutors] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTutors, setTotalTutors] = useState(0);
  const [loading, setLoading] = useState(true);

  // Config categories
  const [config, setConfig] = useState({
    localities: ['Mayur Vihar Phase 1', 'Mayur Vihar Phase 2', 'Mayur Vihar Phase 3', 'Patparganj (IP Extension)', 'Preet Vihar', 'Laxmi Nagar'],
    classes: ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12', 'Competitive: JEE', 'Competitive: NEET'],
    boards: ['CBSE', 'ICSE', 'State Board'],
    subjects: ['Mathematics', 'Science', 'Physics', 'Chemistry', 'Biology', 'Economics', 'Computer Science / Coding']
  });

  // Comparison State (up to 3 tutors)
  const [comparingTutors, setComparingTutors] = useState([]);
  const [comparisonModalOpen, setComparisonModalOpen] = useState(false);

  // Saved Tutors
  const [savedTutorIds, setSavedTutorIds] = useState([]);

  // Booking Modal
  const [selectedTutorForBooking, setSelectedTutorForBooking] = useState(null);

  // Mobile Filter Drawer
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Load config & saved tutors
  useEffect(() => {
    apiRequest('/settings/config')
      .then((res) => res.success && setConfig(res.config))
      .catch(() => {});

    if (isAuthenticated && role === 'parent') {
      apiRequest('/support/saved-tutors')
        .then((res) => {
          if (res.success && res.tutors) {
            setSavedTutorIds(res.tutors.map((t) => t._id));
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated, role]);

  // Sync state to query params & fetch tutors
  const fetchTutors = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (teachingMode) params.append('teachingMode', teachingMode);
      if (subject) params.append('subject', subject);
      if (classGrade) params.append('classGrade', classGrade);
      if (locality) params.append('locality', locality);
      if (minFee) params.append('minFee', minFee);
      if (maxFee) params.append('maxFee', maxFee);
      if (minExp) params.append('minExp', minExp);
      if (verifiedOnly) params.append('verifiedOnly', 'true');
      if (demoAvailable) params.append('demoAvailable', 'true');
      if (sortBy) params.append('sortBy', sortBy);
      params.append('page', page);
      params.append('limit', '12');

      const data = await apiRequest(`/tutors?${params.toString()}`);
      if (data.success) {
        setTutors(data.tutors || []);
        setTotalPages(data.totalPages || 1);
        setTotalTutors(data.total || 0);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load tutors', 'error');
    } finally {
      setLoading(false);
    }
  }, [teachingMode, subject, classGrade, locality, minFee, maxFee, minExp, verifiedOnly, demoAvailable, sortBy, page, showToast]);

  useEffect(() => {
    fetchTutors();
  }, [fetchTutors]);

  // Reset filters
  const handleResetFilters = () => {
    setTeachingMode('');
    setSubject('');
    setClassGrade('');
    setLocality('');
    setMinFee('');
    setMaxFee('');
    setMinExp('');
    setVerifiedOnly(false);
    setDemoAvailable(false);
    setSortBy('best_match');
    setPage(1);
    setSearchParams({});
  };

  // Toggle Compare
  const handleToggleCompare = (tutor) => {
    setComparingTutors((prev) => {
      const exists = prev.some((t) => t._id === tutor._id);
      if (exists) {
        return prev.filter((t) => t._id !== tutor._id);
      } else {
        if (prev.length >= 3) {
          showToast('You can compare a maximum of 3 tutors at a time.', 'info');
          return prev;
        }
        return [...prev, tutor];
      }
    });
  };

  // Toggle Save Tutor
  const handleSaveTutor = async (tutorProfileId) => {
    if (!isAuthenticated) {
      showToast('Please sign in to save tutors to your list.', 'info');
      navigate('/login');
      return;
    }
    if (role !== 'parent') {
      showToast('Only parent accounts can save tutors.', 'info');
      return;
    }

    try {
      const res = await apiRequest('/support/save-tutor', {
        method: 'POST',
        body: JSON.stringify({ tutorProfileId })
      });

      if (res.success) {
        showToast(res.message, 'success');
        setSavedTutorIds((prev) =>
          res.isSaved ? [...prev, tutorProfileId] : prev.filter((id) => id !== tutorProfileId)
        );
      }
    } catch (err) {
      showToast(err.message || 'Action failed', 'error');
    }
  };

  const handleBookClick = (tutor) => {
    if (!isAuthenticated) {
      showToast('Please sign in or create a parent account to book tuition.', 'info');
      navigate('/login');
      return;
    }
    if (role === 'tutor') {
      showToast('Tutor accounts cannot book other tutors.', 'info');
      return;
    }
    setSelectedTutorForBooking(tutor);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Breadcrumb & Title */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Discover Verified Tutors
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Showing {totalTutors} qualified teachers matching your criteria in Delhi NCR
            </p>
          </div>

          {/* Top Sort By Dropdown & Mobile Filter Button */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between">
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 px-3.5 py-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-700 shadow-sm"
            >
              <SlidersHorizontal className="w-4 h-4 text-teal-600" />
              Filters
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 whitespace-nowrap hidden sm:inline">
                Sort By:
              </span>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 focus:ring-teal-500"
              >
                <option value="best_match">Best Match</option>
                <option value="lowest_fee">Lowest Hourly Fee</option>
                <option value="highest_rating">Highest Rating</option>
                <option value="highest_experience">Most Experienced</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content Layout: Filter Sidebar + Tutor Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* DESKTOP FILTER SIDEBAR */}
          <aside className="hidden lg:block bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-6 sticky top-24">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <SlidersHorizontal className="w-4 h-4 text-teal-600" />
                <span>Filters</span>
              </div>
              <button
                onClick={handleResetFilters}
                className="text-xs text-slate-400 hover:text-slate-600 font-medium flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            </div>

            {/* 1. Teaching Mode Filter */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Teaching Mode
              </label>
              <div className="space-y-1.5 text-xs font-medium text-slate-700">
                {[
                  { id: '', label: 'All Modes' },
                  { id: 'online', label: 'Online Tuition' },
                  { id: 'student_home', label: "Student's Home" },
                  { id: 'tutor_centre', label: "Tutor's Centre" }
                ].map((mode) => (
                  <label key={mode.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="teachingMode"
                      value={mode.id}
                      checked={teachingMode === mode.id}
                      onChange={(e) => {
                        setTeachingMode(e.target.value);
                        setPage(1);
                      }}
                      className="text-teal-600 focus:ring-teal-500"
                    />
                    <span>{mode.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 2. Class / Level */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Class / Level
              </label>
              <select
                value={classGrade}
                onChange={(e) => {
                  setClassGrade(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800"
              >
                <option value="">All Classes</option>
                {config.classes.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* 3. Subject */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Subject
              </label>
              <select
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800"
              >
                <option value="">All Subjects</option>
                {config.subjects.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* 4. Locality */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Locality (East Delhi)
              </label>
              <select
                value={locality}
                onChange={(e) => {
                  setLocality(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800"
              >
                <option value="">Any Locality</option>
                {config.localities.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            {/* 5. Hourly Budget Filter */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Max Budget (₹/hour)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min ₹"
                  value={minFee}
                  onChange={(e) => setMinFee(e.target.value)}
                  className="w-1/2 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                />
                <span className="text-slate-400">-</span>
                <input
                  type="number"
                  placeholder="Max ₹"
                  value={maxFee}
                  onChange={(e) => setMaxFee(e.target.value)}
                  className="w-1/2 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                />
              </div>
            </div>

            {/* 6. Checkboxes: Verified Credentials & Free Demo */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => {
                    setVerifiedOnly(e.target.checked);
                    setPage(1);
                  }}
                  className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                />
                <span>Verified Qualifications Only</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={demoAvailable}
                  onChange={(e) => {
                    setDemoAvailable(e.target.checked);
                    setPage(1);
                  }}
                  className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                />
                <span>Free Trial / Demo Available</span>
              </label>
            </div>
          </aside>

          {/* TUTOR CARDS LISTING GRID */}
          <main className="lg:col-span-3 space-y-6">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-80 rounded-2xl bg-white border border-slate-200 animate-pulse"></div>
                ))}
              </div>
            ) : tutors.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Search className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No tutors found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  We couldn't find any teachers matching your exact filters. Try relaxing the subject, locality, or fee range.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tutors.map((tutor) => (
                  <TutorCard
                    key={tutor._id}
                    tutor={tutor}
                    onBook={handleBookClick}
                    onSave={handleSaveTutor}
                    isSaved={savedTutorIds.includes(tutor._id)}
                    onToggleCompare={handleToggleCompare}
                    isComparing={comparingTutors.some((t) => t._id === tutor._id)}
                  />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-xs font-semibold text-slate-600 px-3">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* FLOATING COMPARISON BAR (IF 1+ TUTORS SELECTED) */}
      {comparingTutors.length > 0 && (
        <div className="fixed bottom-6 inset-x-4 max-w-3xl mx-auto z-40 bg-slate-900 text-white rounded-2xl shadow-2xl p-4 flex items-center justify-between gap-4 border border-slate-800 animate-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center gap-3">
            <Layers className="w-5 h-5 text-teal-400 shrink-0" />
            <div>
              <div className="font-bold text-sm">
                Comparing {comparingTutors.length} of 3 tutors
              </div>
              <div className="text-[11px] text-slate-400 truncate max-w-sm">
                {comparingTutors.map((t) => t.user?.name).join(', ')}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setComparingTutors([])}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
            <button
              onClick={() => setComparisonModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold text-xs transition-colors"
            >
              Compare Side-by-Side
            </button>
          </div>
        </div>
      )}

      {/* Side-by-Side Comparison Modal */}
      {comparisonModalOpen && (
        <TutorComparisonModal
          tutors={comparingTutors}
          onClose={() => setComparisonModalOpen(false)}
          onBookTutor={handleBookClick}
        />
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
