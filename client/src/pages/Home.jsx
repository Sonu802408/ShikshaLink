import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  MapPin,
  Laptop,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Users,
  Award,
  ArrowRight
} from 'lucide-react';
import { apiRequest } from '../services/api';
import { TutorCard } from '../components/tutors/TutorCard';
import { BookingModal } from '../components/bookings/BookingModal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();
  const { showToast } = useToast();

  // Search Form State
  const [classGrade, setClassGrade] = useState('');
  const [board, setBoard] = useState('');
  const [subject, setSubject] = useState('');
  const [teachingMode, setTeachingMode] = useState('');
  const [locality, setLocality] = useState('');

  // Platform Config & Featured Tutors
  const [config, setConfig] = useState({
    localities: ['Mayur Vihar Phase 1', 'Mayur Vihar Phase 2', 'Mayur Vihar Phase 3', 'Patparganj (IP Extension)', 'Preet Vihar', 'Laxmi Nagar'],
    classes: ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12', 'Competitive: JEE', 'Competitive: NEET'],
    boards: ['CBSE', 'ICSE', 'State Board', 'NIOS'],
    subjects: ['Mathematics', 'Science', 'Physics', 'Chemistry', 'Biology', 'Economics', 'Computer Science / Coding']
  });
  const [featuredTutors, setFeaturedTutors] = useState([]);
  const [loadingTutors, setLoadingTutors] = useState(true);

  // Booking Modal
  const [selectedTutorForBooking, setSelectedTutorForBooking] = useState(null);

  // FAQ Accordion
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [configRes, tutorsRes] = await Promise.all([
          apiRequest('/settings/config').catch(() => null),
          apiRequest('/tutors?limit=4&sortBy=highest_rating').catch(() => null)
        ]);

        if (configRes?.success && configRes.config) {
          setConfig(configRes.config);
        }
        if (tutorsRes?.success && tutorsRes.tutors) {
          setFeaturedTutors(tutorsRes.tutors);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingTutors(false);
      }
    };
    fetchData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (classGrade) params.append('classGrade', classGrade);
    if (board) params.append('board', board);
    if (subject) params.append('subject', subject);
    if (teachingMode) params.append('mode', teachingMode);
    if (locality) params.append('locality', locality);
    navigate(`/find-tutors?${params.toString()}`);
  };

  const handleBookClick = (tutor) => {
    if (!isAuthenticated) {
      showToast('Please sign in or create a parent account to book tuition.', 'info');
      navigate('/login');
      return;
    }
    if (role === 'tutor') {
      showToast('Tutor accounts cannot book other tutors. Please log in as a parent.', 'info');
      return;
    }
    setSelectedTutorForBooking(tutor);
  };

  const faqs = [
    {
      q: 'How does ShikshaLink verify tutor qualifications?',
      a: 'Tutors upload government IDs, university degree certificates, and mark sheets. Our verification team manually audits each document before approving the "Degree Verified" badge. We never label a tutor background checked unless that specific check has genuinely been completed and recorded.'
    },
    {
      q: 'What teaching modes can I choose from?',
      a: 'ShikshaLink supports three distinct modes: (1) Online tuition through interactive live video sessions, (2) Student’s Home tuition where the teacher visits your home in your locality, and (3) Tutor’s Centre where students attend focused batches in the teacher’s equipped classroom.'
    },
    {
      q: 'How does the free demo class work?',
      a: 'Many verified tutors offer a free 45-60 minute trial session. You can request a demo directly from their profile by selecting your child and preferred schedule. The tutor confirms the slot or proposes an alternative time that works for both parties.'
    },
    {
      q: 'Is my child’s personal information protected?',
      a: 'Yes. Child data is strictly sensitive on ShikshaLink. We never display a child’s full name, school, exact address, or contact details publicly. For home tuition, your address and phone number are revealed only to the confirmed tutor after mutual acceptance.'
    },
    {
      q: 'Are there hidden commission fees for parents?',
      a: 'No. Searching, contacting, and requesting demo classes is 100% free for parents. You agree on transparent fees directly with the tutor according to their published rate card.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-sky-50/70 via-white to-slate-50 pt-10 pb-20 lg:pt-16 lg:pb-28 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>Dedicated Tutoring in Mayur Vihar & Delhi NCR</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Find the Right Tutor for Your Child
            </h1>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Qualified teachers, flexible timings, transparent fees, and tuition that fits your family. Choose from home visits, interactive online classes, or neighbourhood centres.
            </p>
          </div>

          {/* TUTOR SEARCH FORM (HERO) */}
          <div className="mt-10 max-w-5xl mx-auto bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200/90 p-5 sm:p-7">
            <form onSubmit={handleSearchSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {/* 1. Class / Grade */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Class / Level
                  </label>
                  <select
                    value={classGrade}
                    onChange={(e) => setClassGrade(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-teal-500 bg-white"
                  >
                    <option value="">All Classes</option>
                    {config.classes.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* 2. Board */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Board
                  </label>
                  <select
                    value={board}
                    onChange={(e) => setBoard(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-teal-500 bg-white"
                  >
                    <option value="">Any Board</option>
                    {config.boards.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                {/* 3. Subject */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Subject
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-teal-500 bg-white"
                  >
                    <option value="">Any Subject</option>
                    {config.subjects.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* 4. Teaching Mode */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Teaching Mode
                  </label>
                  <select
                    value={teachingMode}
                    onChange={(e) => setTeachingMode(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-teal-500 bg-white"
                  >
                    <option value="">All Modes</option>
                    <option value="online">Online Tuition</option>
                    <option value="student_home">Student's Home</option>
                    <option value="tutor_centre">Tutor's Centre</option>
                  </select>
                </div>

                {/* 5. Locality */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Locality / Area
                  </label>
                  <select
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-teal-500 bg-white"
                  >
                    <option value="">East Delhi & All</option>
                    {config.localities.map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action row */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  <span>Real teacher profiles • Transparent hourly fee • Genuine reviews</span>
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-7 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  Search Tutors
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* 3 TEACHING MODES SHOWCASE */}
      <section className="py-16 bg-white border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Three Flexible Ways to Learn
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Every family has different schedules and comfort levels. Choose what works best for your child.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Mode 1: Online Tuition */}
            <div className="rounded-3xl p-7 border border-blue-100 bg-gradient-to-b from-blue-50/50 to-white shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                  <Laptop className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">1. Online Tuition</h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Tutor teaches remotely through interactive live classes with digital whiteboards, screen-sharing, and recorded revisions.
                  </p>
                </div>
                <ul className="space-y-2 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>No travel hassle, study from home comfort</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Access top educators from across Delhi NCR</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Secure meeting links & digital session reminders</span>
                  </li>
                </ul>
              </div>
              <Link
                to="/find-tutors?mode=online"
                className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-800"
              >
                Browse Online Tutors <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Mode 2: Student's Home */}
            <div className="rounded-3xl p-7 border border-amber-100 bg-gradient-to-b from-amber-50/50 to-white shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">2. Student's Home</h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Tutor travels to your home in Mayur Vihar, Patparganj, or neighbouring sectors for dedicated one-on-one attention.
                  </p>
                </div>
                <ul className="space-y-2 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>100% focused individual supervision</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Direct parental oversight in your own home</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Exact address shared only upon booking confirmation</span>
                  </li>
                </ul>
              </div>
              <Link
                to="/find-tutors?mode=student_home"
                className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-800"
              >
                Find Home Tutors <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Mode 3: Tutor's Centre */}
            <div className="rounded-3xl p-7 border border-purple-100 bg-gradient-to-b from-purple-50/50 to-white shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">3. Tutor's Centre</h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Student visits the tutor’s dedicated teaching centre or small-batch classroom in your neighbourhood.
                  </p>
                </div>
                <ul className="space-y-2 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Structured academic environment & whiteboard</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Small batches (max 6-8 peers) for collaborative learning</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Affordable per-student monthly batch pricing</span>
                  </li>
                </ul>
              </div>
              <Link
                to="/find-tutors?mode=tutor_centre"
                className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:text-purple-800"
              >
                Explore Nearby Centres <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED VERIFIED TUTORS (REAL DATABASE DATA) */}
      <section className="py-16 bg-slate-50 border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
                Verified Faculty
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Top Rated Tutors in Delhi NCR
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Showing real tutors with verified credentials from our active database.
              </p>
            </div>
            <Link
              to="/find-tutors"
              className="text-xs font-bold text-slate-700 hover:text-teal-600 flex items-center gap-1"
            >
              View All Tutors <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loadingTutors ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-72 rounded-2xl bg-white border border-slate-200 animate-pulse"></div>
              ))}
            </div>
          ) : featuredTutors.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500 bg-white rounded-2xl border border-slate-200">
              No tutors available at the moment.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredTutors.map((tutor) => (
                <TutorCard
                  key={tutor._id}
                  tutor={tutor}
                  onBook={handleBookClick}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 bg-white border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
              Simple & Transparent
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              How the Booking Process Works
            </h2>
            <p className="text-xs text-slate-500 mt-2">
              From requirement post to confirmed tuition in four clear steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                1
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Post Requirement or Discover</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Filter by class, subject, budget, and teaching mode, or post your requirement and let matched teachers respond.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="w-8 h-8 rounded-xl bg-teal-600 text-white font-bold text-xs flex items-center justify-center">
                2
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Request Trial / Demo</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pick a convenient time slot and send a demo request. The tutor can accept or propose an alternative time.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="w-8 h-8 rounded-xl bg-sky-600 text-white font-bold text-xs flex items-center justify-center">
                3
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Mutual Confirmation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Both parties agree on the schedule. Meeting links or protected addresses are unlocked only upon confirmation.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                4
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Learn & Review</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Complete the class and leave genuine multi-criteria feedback on teaching quality, punctuality, and communication.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FREQUENTLY ASKED QUESTIONS */}
      <section className="py-16 bg-slate-50 border-b border-slate-200/70">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-slate-500 mt-2">
              Everything you need to know about safety, verification, and booking
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                  className="w-full p-5 text-left font-bold text-sm text-slate-900 flex items-center justify-between gap-4"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                      openFaq === idx ? 'rotate-180 text-teal-600' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      {selectedTutorForBooking && (
        <BookingModal
          tutor={selectedTutorForBooking}
          onClose={() => setSelectedTutorForBooking(null)}
          onBookingSuccess={() => {
            setSelectedTutorForBooking(null);
          }}
        />
      )}
    </div>
  );
};
