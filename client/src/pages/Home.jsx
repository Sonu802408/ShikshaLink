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
  ArrowRight,
  Star,
  GraduationCap
} from 'lucide-react';
import { apiRequest } from '../services/api';
import { TutorCard } from '../components/tutors/TutorCard';
import { Card3D } from '../components/common/Card3D';
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

  const handleIAmATutor = async () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/tutor/register&role=tutor');
      return;
    }
    if (role === 'tutor') {
      try {
        const res = await apiRequest('/tutors/profile/me');
        if (res.success && res.profile && res.profile.profileStatus === 'published') {
          navigate('/tutor');
        } else {
          navigate('/tutor/register');
        }
      } catch (err) {
        navigate('/tutor/register');
      }
    } else {
      navigate('/tutor/register');
    }
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
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      {/* HERO SECTION WITH LAYERED 3D DEPTH & FLOATING DECORATIVE BADGES */}
      <section className="relative overflow-hidden bg-gradient-to-b from-sky-100/50 via-teal-50/20 to-slate-50 pt-12 pb-24 lg:pt-20 lg:pb-32 border-b border-slate-200/60">
        {/* Soft 3D Ambient Gradient Orbs */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-sky-300/30 via-teal-200/25 to-blue-300/20 rounded-full blur-3xl -z-10" />
        <div className="pointer-events-none absolute top-1/3 -left-32 w-80 h-80 bg-teal-300/15 rounded-full blur-2xl -z-10" />
        <div className="pointer-events-none absolute top-1/4 -right-32 w-80 h-80 bg-sky-300/15 rounded-full blur-2xl -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Hero Header */}
          <div className="max-w-3xl mx-auto text-center space-y-5 relative">
            {/* Floating 3D Trust Badges on Desktop */}
            <div className="hidden xl:block absolute -left-40 top-4 animate-float-slow pointer-events-none">
              <div className="p-3 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-[0_12px_24px_-6px_rgba(15,23,42,0.12)] flex items-center gap-2.5 text-xs font-bold text-slate-800">
                <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-black">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                </span>
                <div className="text-left">
                  <div>4.9 / 5.0 Rating</div>
                  <div className="text-[10px] text-slate-400 font-semibold">Verified Parents</div>
                </div>
              </div>
            </div>

            <div className="hidden xl:block absolute -right-44 top-16 animate-float-reverse pointer-events-none">
              <div className="p-3 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-[0_12px_24px_-6px_rgba(15,23,42,0.12)] flex items-center gap-2.5 text-xs font-bold text-slate-800">
                <span className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-black">
                  <ShieldCheck className="w-4 h-4 text-teal-700" />
                </span>
                <div className="text-left">
                  <div>100% Audited Proofs</div>
                  <div className="text-[10px] text-slate-400 font-semibold">Degree Verified</div>
                </div>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-teal-200/80 text-teal-900 text-xs font-bold shadow-[0_4px_12px_rgba(13,148,136,0.1)]">
              <Sparkles className="w-4 h-4 text-teal-600 animate-spin-slow" />
              <span>Dedicated Tutoring in Mayur Vihar & Delhi NCR</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
              Find the Right Tutor for Your Child
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
              Qualified teachers, flexible timings, transparent fees, and tuition that fits your family. Choose from home visits, interactive online classes, or neighbourhood centres.
            </p>

            {/* Quick Hero CTAs with 3D Styling */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link to="/find-tutors" className="btn-3d-primary px-6 py-3 rounded-2xl text-xs sm:text-sm">
                Explore All Tutors <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
              <Link to={isAuthenticated && role === 'parent' ? '/parent/cart' : '/find-tutors'} className="btn-3d-secondary px-6 py-3 rounded-2xl text-xs sm:text-sm">
                {isAuthenticated && role === 'parent' ? 'My Tutor Cart' : 'Browse Teachers'}
              </Link>
            </div>
          </div>

          {/* TWO MAIN ENTRY OPTIONS (LARGE INTERACTIVE 3D CARDS) */}
          <div className="mt-12 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 relative">
            {/* CARD A: I am a Parent */}
            <Card3D maxTilt={7} className="h-full">
              <div className="h-full p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-white via-teal-50/40 to-emerald-50/50 border border-teal-200/80 shadow-[0_20px_45px_-10px_rgba(13,148,136,0.18)] hover:shadow-[0_25px_55px_-10px_rgba(13,148,136,0.3)] transition-all flex flex-col justify-between group">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white flex items-center justify-center shadow-lg shadow-teal-600/30 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                      <GraduationCap className="w-8 h-8" />
                    </div>
                    <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-teal-100 text-teal-800 border border-teal-200">
                      FOR PARENTS
                    </span>
                  </div>

                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 group-hover:text-teal-700 transition-colors">
                      I am a Parent
                    </h2>
                    <p className="text-sm font-semibold text-slate-600 mt-1">
                      Find the right tutor for your child.
                    </p>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed">
                    Connect with degree-verified educators for 1-on-1 home tuition, interactive online classes, or neighbourhood study centres across Delhi NCR.
                  </p>

                  <ul className="space-y-2 pt-2 text-xs font-medium text-slate-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                      <span>100% Background & Degree-Verified Teachers</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                      <span>Transparent Hourly Rates & 3 Days Free Trial</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                      <span>Tailored to CBSE, ICSE, IB & Competitive syllabus</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-6 mt-6 border-t border-teal-100">
                  <Link
                    to={isAuthenticated && role === 'parent' ? '/parent/cart' : '/find-tutors'}
                    className="btn-3d-primary w-full py-3.5 px-6 rounded-2xl text-xs sm:text-sm uppercase tracking-wider font-bold flex items-center justify-center gap-2 shadow-lg"
                  >
                    <span>Find a Tutor</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </Card3D>

            {/* CARD B: I am a Tutor */}
            <Card3D maxTilt={7} className="h-full">
              <div className="h-full p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-white via-slate-50/50 to-indigo-50/50 border border-indigo-200/80 shadow-[0_20px_45px_-10px_rgba(79,70,229,0.15)] hover:shadow-[0_25px_55px_-10px_rgba(79,70,229,0.28)] transition-all flex flex-col justify-between group">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-900 to-indigo-900 text-white flex items-center justify-center shadow-lg shadow-indigo-900/30 group-hover:scale-110 group-hover:-rotate-3 transition-transform">
                      <Award className="w-8 h-8 text-amber-300" />
                    </div>
                    <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-900 border border-indigo-200">
                      FOR EDUCATORS
                    </span>
                  </div>

                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 group-hover:text-indigo-700 transition-colors">
                      I am a Tutor
                    </h2>
                    <p className="text-sm font-semibold text-slate-600 mt-1">
                      Teach students. Build your career.
                    </p>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed">
                    Set your own fees, choose your teaching modes, manage your availability calendar, and receive direct tuition inquiries from verified parents.
                  </p>

                  <ul className="space-y-2 pt-2 text-xs font-medium text-slate-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>10% Platform Fee applicable</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>Teach Online, at Student's Home, or at center</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>Official "Degree Verified" badge boosts parent inquiries</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-6 mt-6 border-t border-indigo-100">
                  <button
                    onClick={handleIAmATutor}
                    className="btn-3d-navy w-full py-3.5 px-6 rounded-2xl text-xs sm:text-sm uppercase tracking-wider font-bold flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                  >
                    <span>I am a Tutor</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card3D>
          </div>

          {/* TUTOR SEARCH FORM (HERO) ELEVATED WITH 3D GLASS DEPTH */}
          <div className="mt-12 max-w-5xl mx-auto bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_25px_50px_-12px_rgba(15,23,42,0.16)] border border-slate-200/90 p-5 sm:p-8 relative">
            <form onSubmit={handleSearchSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                {/* 1. Class / Grade */}
                <div>
                  <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1">
                    Class / Level
                  </label>
                  <select
                    value={classGrade}
                    onChange={(e) => setClassGrade(e.target.value)}
                    className="input-3d w-full px-3 py-2.5 text-xs font-semibold text-slate-800"
                  >
                    <option value="">All Classes</option>
                    {config.classes.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* 2. Board */}
                <div>
                  <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1">
                    Board
                  </label>
                  <select
                    value={board}
                    onChange={(e) => setBoard(e.target.value)}
                    className="input-3d w-full px-3 py-2.5 text-xs font-semibold text-slate-800"
                  >
                    <option value="">Any Board</option>
                    {config.boards.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                {/* 3. Subject */}
                <div>
                  <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1">
                    Subject
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="input-3d w-full px-3 py-2.5 text-xs font-semibold text-slate-800"
                  >
                    <option value="">Any Subject</option>
                    {config.subjects.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* 4. Teaching Mode */}
                <div>
                  <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1">
                    Teaching Mode
                  </label>
                  <select
                    value={teachingMode}
                    onChange={(e) => setTeachingMode(e.target.value)}
                    className="input-3d w-full px-3 py-2.5 text-xs font-semibold text-slate-800"
                  >
                    <option value="">All Modes</option>
                    <option value="online">Online Tuition</option>
                    <option value="student_home">Student's Home</option>
                    <option value="tutor_centre">Tutor's Centre</option>
                  </select>
                </div>

                {/* 5. Locality */}
                <div>
                  <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1">
                    Locality / Area
                  </label>
                  <select
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    className="input-3d w-full px-3 py-2.5 text-xs font-semibold text-slate-800"
                  >
                    <option value="">East Delhi & All</option>
                    {config.localities.map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action row with 3D Search button */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Real teacher profiles • Transparent hourly fee • Genuine reviews</span>
                </div>
                <button
                  type="submit"
                  className="btn-3d-navy w-full sm:w-auto px-8 py-3 rounded-xl text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  Search Tutors
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* 3 TEACHING MODES SHOWCASE WITH 3D TILT CARDS */}
      <section className="py-20 bg-white border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
              Personalized Learning Formats
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1">
              Three Flexible Ways to Learn
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Every family has different schedules and comfort levels. Choose what works best for your child.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Mode 1: Online Tuition */}
            <Card3D maxTilt={6}>
              <div className="rounded-3xl p-7 border border-blue-200/70 bg-gradient-to-b from-blue-50/70 via-white to-white shadow-[0_10px_25px_-5px_rgba(37,99,235,0.08)] hover:shadow-[0_20px_35px_-8px_rgba(37,99,235,0.18)] transition-all flex flex-col justify-between h-full">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 to-blue-500 text-white flex items-center justify-center shadow-[0_4px_12px_rgba(37,99,235,0.3)]">
                    <Laptop className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">1. Online Tuition</h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      Tutor teaches remotely through interactive live classes with digital whiteboards, screen-sharing, and recorded revisions.
                    </p>
                  </div>
                  <ul className="space-y-2.5 text-xs text-slate-600">
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
                  className="mt-6 inline-flex items-center gap-1.5 text-xs font-black text-blue-700 hover:text-blue-900 group"
                >
                  Browse Online Tutors <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </Card3D>

            {/* Mode 2: Student's Home */}
            <Card3D maxTilt={6}>
              <div className="rounded-3xl p-7 border border-amber-200/70 bg-gradient-to-b from-amber-50/70 via-white to-white shadow-[0_10px_25px_-5px_rgba(217,119,6,0.08)] hover:shadow-[0_20px_35px_-8px_rgba(217,119,6,0.18)] transition-all flex flex-col justify-between h-full">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-500 text-white flex items-center justify-center shadow-[0_4px_12px_rgba(217,119,6,0.3)]">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">2. Student's Home</h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      Tutor travels to your home in Mayur Vihar, Patparganj, or neighbouring sectors for dedicated one-on-one attention.
                    </p>
                  </div>
                  <ul className="space-y-2.5 text-xs text-slate-600">
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
                  className="mt-6 inline-flex items-center gap-1.5 text-xs font-black text-amber-700 hover:text-amber-900 group"
                >
                  Find Home Tutors <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </Card3D>

            {/* Mode 3: Tutor's Centre */}
            <Card3D maxTilt={6}>
              <div className="rounded-3xl p-7 border border-purple-200/70 bg-gradient-to-b from-purple-50/70 via-white to-white shadow-[0_10px_25px_-5px_rgba(147,51,234,0.08)] hover:shadow-[0_20px_35px_-8px_rgba(147,51,234,0.18)] transition-all flex flex-col justify-between h-full">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-700 to-purple-500 text-white flex items-center justify-center shadow-[0_4px_12px_rgba(147,51,234,0.3)]">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">3. Tutor's Centre</h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      Student visits the tutor’s dedicated teaching centre or small-batch classroom in your neighbourhood.
                    </p>
                  </div>
                  <ul className="space-y-2.5 text-xs text-slate-600">
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
                  className="mt-6 inline-flex items-center gap-1.5 text-xs font-black text-purple-700 hover:text-purple-900 group"
                >
                  Explore Nearby Centres <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </Card3D>
          </div>
        </div>
      </section>

      {/* FEATURED VERIFIED TUTORS (REAL DATABASE DATA WITH 3D CARDS) */}
      <section className="py-20 bg-slate-50 border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
                Verified Faculty
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1">
                Top Rated Tutors in Delhi NCR
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Showing real tutors with verified credentials from our active database.
              </p>
            </div>
            <Link
              to="/find-tutors"
              className="btn-3d-secondary px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              View All Tutors <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loadingTutors ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-80 rounded-3xl bg-white border border-slate-200 animate-pulse"></div>
              ))}
            </div>
          ) : featuredTutors.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500 bg-white rounded-3xl border border-slate-200">
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

      {/* HOW IT WORKS WITH 3D NUMBERED BLOCKS */}
      <section className="py-20 bg-white border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
              Simple & Transparent
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1">
              How the Booking Process Works
            </h2>
            <p className="text-xs text-slate-500 mt-2">
              From requirement post to confirmed tuition in four clear steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4 hover:shadow-md hover:-translate-y-1 transition-all duration-200">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-700 text-white font-black text-sm flex items-center justify-center shadow-[0_4px_10px_rgba(15,23,42,0.2)]">
                1
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Post Requirement or Discover</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Filter by class, subject, budget, and teaching mode, or post your requirement and let matched teachers respond.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4 hover:shadow-md hover:-translate-y-1 transition-all duration-200">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-700 to-teal-500 text-white font-black text-sm flex items-center justify-center shadow-[0_4px_10px_rgba(13,148,136,0.25)]">
                2
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Request Trial / Demo</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pick a convenient time slot and send a demo request. The tutor can accept or propose an alternative time.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4 hover:shadow-md hover:-translate-y-1 transition-all duration-200">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-700 to-sky-500 text-white font-black text-sm flex items-center justify-center shadow-[0_4px_10px_rgba(2,132,199,0.25)]">
                3
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Mutual Confirmation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Both parties agree on the schedule. Meeting links or protected addresses are unlocked only upon confirmation.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4 hover:shadow-md hover:-translate-y-1 transition-all duration-200">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-700 to-emerald-500 text-white font-black text-sm flex items-center justify-center shadow-[0_4px_10px_rgba(5,150,105,0.25)]">
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

      {/* FREQUENTLY ASKED QUESTIONS WITH ELEVATED ACCORDION CARDS */}
      <section className="py-20 bg-slate-50 border-b border-slate-200/70">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-slate-500 mt-2">
              Everything you need to know about safety, verification, and booking
            </p>
          </div>

          <div className="space-y-3.5">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-[0_4px_14px_rgba(0,0,0,0.03)] hover:shadow-md transition-all duration-200"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                  className="w-full p-5 text-left font-bold text-sm text-slate-900 flex items-center justify-between gap-4"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
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
