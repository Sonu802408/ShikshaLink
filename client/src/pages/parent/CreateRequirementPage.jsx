import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Laptop,
  MapPin,
  Building2,
  DollarSign,
  Calendar,
  Sparkles,
  AlertCircle,
  ShieldCheck,
  User,
  BookOpen,
  Edit3
} from 'lucide-react';
import { apiRequest } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const CreateRequirementPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [children, setChildren] = useState([]);
  const [loadingChildren, setLoadingChildren] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  // Step 1: Student Information
  const [childId, setChildId] = useState('new');
  const [studentName, setStudentName] = useState('');
  const [classGrade, setClassGrade] = useState('Class 10');
  const [board, setBoard] = useState('CBSE');
  const [medium, setMedium] = useState('English');
  const [subjectsStr, setSubjectsStr] = useState('Mathematics, Science');
  const [preferredLanguage, setPreferredLanguage] = useState('English & Hindi');
  const [learningGoals, setLearningGoals] = useState('Needs strong conceptual clarity and preparation for board exams.');
  const [specialNeeds, setSpecialNeeds] = useState('');
  const [studentCount, setStudentCount] = useState('individual'); // 'individual' or 'group'

  // Step 2: Teaching Arrangements (Multi-select)
  const [teachingModes, setTeachingModes] = useState(['student_home']);

  // Step 3: Schedule & Timings
  const [tuitionType, setTuitionType] = useState('regular'); // 'regular', 'short_term', 'crash_course', 'one_time'
  const [preferredDays, setPreferredDays] = useState(['Monday', 'Wednesday', 'Friday']);
  const [timeRanges, setTimeRanges] = useState(['Evening (4 PM - 7 PM)']);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [classesPerWeek, setClassesPerWeek] = useState(3);
  const [durationHours, setDurationHours] = useState(1.5);

  // Step 4: Budget
  const [minBudget, setMinBudget] = useState(500);
  const [maxBudget, setMaxBudget] = useState(800);
  const [monthlyBudget, setMonthlyBudget] = useState(6000);
  const [budgetType, setBudgetType] = useState('hourly');
  const [isFlexible, setIsFlexible] = useState(true);
  const [groupTuitionOk, setGroupTuitionOk] = useState(false);

  // Step 5: Location & Preferences
  const [city, setCity] = useState('Delhi');
  const [locality, setLocality] = useState('Mayur Vihar Phase 1');
  const [pincode, setPincode] = useState('110091');
  const [maxTravelDistanceKm, setMaxTravelDistanceKm] = useState(5);
  const [minExperienceYears, setMinExperienceYears] = useState(2);
  const [genderPreference, setGenderPreference] = useState('no_preference');
  const [specificRequirements, setSpecificRequirements] = useState('');

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const res = await apiRequest('/parents/children');
        if (res.success && res.children) {
          setChildren(res.children);
          if (res.children.length > 0) {
            setChildId(res.children[0]._id);
            setStudentName(res.children[0].fullName || res.children[0].displayName || '');
            setClassGrade(res.children[0].classGrade || 'Class 10');
            setBoard(res.children[0].board || 'CBSE');
            if (res.children[0].subjects?.length > 0) {
              setSubjectsStr(res.children[0].subjects.join(', '));
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingChildren(false);
      }
    };
    fetchChildren();
  }, []);

  const toggleTeachingMode = (modeId) => {
    setTeachingModes((prev) => {
      if (prev.includes(modeId)) {
        if (prev.length === 1) {
          showToast('Please select at least one teaching mode.', 'error');
          return prev;
        }
        return prev.filter((m) => m !== modeId);
      }
      return [...prev, modeId];
    });
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (childId === 'new' && !studentName.trim()) {
        showToast('Please enter the student\'s name.', 'error');
        return;
      }
      if (!subjectsStr.trim()) {
        showToast('Please specify at least one subject.', 'error');
        return;
      }
    }
    if (currentStep === 2) {
      if (teachingModes.length === 0) {
        showToast('Please select at least one teaching mode.', 'error');
        return;
      }
    }
    setCurrentStep((prev) => Math.min(6, prev + 1));
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const subjects = subjectsStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      let finalChildId = childId;

      // If parent created child inline
      if (childId === 'new' || !finalChildId) {
        const childRes = await apiRequest('/parents/children', {
          method: 'POST',
          body: JSON.stringify({
            fullName: studentName || 'Student',
            displayName: studentName || 'Student',
            classGrade,
            board,
            subjects,
            preferredLanguage,
            learningGoals
          })
        });
        if (childRes.success && childRes.child) {
          finalChildId = childRes.child._id;
        }
      }

      const payload = {
        childId: finalChildId,
        classGrade,
        board,
        medium,
        subjects,
        preferredLanguage,
        learningGoals,
        specialNeeds,
        studentCount,
        teachingMode: teachingModes[0],
        teachingModes,
        schedule: {
          tuitionType,
          preferredDays,
          timeRanges,
          preferredStartDate: new Date(startDate),
          classesPerWeek: Number(classesPerWeek),
          durationHours: Number(durationHours)
        },
        budget: {
          minBudget: Number(minBudget),
          maxBudget: Number(maxBudget),
          monthlyBudget: Number(monthlyBudget),
          isFlexible,
          budgetType,
          groupTuitionOk
        },
        location: {
          city,
          locality,
          pincode,
          maxTravelDistanceKm: Number(maxTravelDistanceKm)
        },
        tutorPreferences: {
          minExperienceYears: Number(minExperienceYears),
          genderPreference,
          specificRequirements
        }
      };

      const res = await apiRequest('/requirements', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (res.success) {
        showToast('Tuition requirement posted successfully! Redirecting to matching tutors...', 'success');
        navigate(`/find-tutors?classGrade=${encodeURIComponent(classGrade)}&subject=${encodeURIComponent(subjects[0] || '')}&teachingMode=${teachingModes[0]}&locality=${encodeURIComponent(locality)}`);
      }
    } catch (err) {
      showToast(err.message || 'Failed to submit requirement', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold mb-2">
          <Sparkles className="w-4 h-4 text-teal-600" />
          <span>Step {currentStep} of 6 — Parent Tuition Requirement Builder</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Post a Tuition Requirement</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Specify your child's syllabus, teaching format, and schedule to match with top-rated background verified educators.
        </p>
      </div>

      {/* Step Indicators */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {[
          { num: 1, name: 'Student' },
          { num: 2, name: 'Modes' },
          { num: 3, name: 'Schedule' },
          { num: 4, name: 'Budget' },
          { num: 5, name: 'Location' },
          { num: 6, name: 'Review' }
        ].map((s) => (
          <button
            key={s.num}
            type="button"
            onClick={() => setCurrentStep(s.num)}
            className={`text-center py-2.5 px-2 rounded-xl text-xs font-bold transition-all shadow-2xs ${
              currentStep === s.num
                ? 'bg-teal-600 text-white shadow-md ring-2 ring-teal-500/20'
                : currentStep > s.num
                ? 'bg-teal-100 text-teal-900'
                : 'bg-slate-200/70 text-slate-500'
            }`}
          >
            <div className="text-[10px] opacity-75">Step {s.num}</div>
            <div>{s.name}</div>
          </button>
        ))}
      </div>

      {/* Step Form Box */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md card-3d p-6 sm:p-8 space-y-6">
        {/* STEP 1: Student Information */}
        {currentStep === 1 && (
          <div className="space-y-5 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Step 1: Student Information & Syllabus</h2>
                <p className="text-slate-500 text-[11px]">Personal details are strictly protected and never publicly exposed.</p>
              </div>
              <ShieldCheck className="w-5 h-5 text-teal-600" />
            </div>

            {/* Existing Child Selector or Add New */}
            {children.length > 0 && (
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Choose Student
                </label>
                <select
                  value={childId}
                  onChange={(e) => {
                    setChildId(e.target.value);
                    if (e.target.value !== 'new') {
                      const selected = children.find((c) => c._id === e.target.value);
                      if (selected) {
                        setStudentName(selected.fullName || selected.displayName || '');
                        setClassGrade(selected.classGrade || 'Class 10');
                        setBoard(selected.board || 'CBSE');
                        if (selected.subjects?.length > 0) {
                          setSubjectsStr(selected.subjects.join(', '));
                        }
                      }
                    } else {
                      setStudentName('');
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold text-slate-800"
                >
                  {children.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.displayName || c.fullName} ({c.classGrade}, {c.board})
                    </option>
                  ))}
                  <option value="new">+ Add Another Student Profile</option>
                </select>
              </div>
            )}

            {(childId === 'new' || children.length === 0) && (
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Student Full Name
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium"
                  required
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Class / Grade (Nursery through Class 12 & Competitive) */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Class / Grade
                </label>
                <select
                  value={classGrade}
                  onChange={(e) => setClassGrade(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                >
                  {[
                    'Nursery / Kindergarten',
                    'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
                    'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
                    'Class 11', 'Class 12',
                    'Competitive: JEE', 'Competitive: NEET', 'Competitive: CUET', 'Competitive: Foundation'
                  ].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Board */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Board
                </label>
                <select
                  value={board}
                  onChange={(e) => setBoard(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                >
                  <option value="CBSE">CBSE</option>
                  <option value="ICSE">ICSE</option>
                  <option value="State Board">State Board</option>
                  <option value="IB">IB (International Baccalaureate)</option>
                  <option value="Cambridge (IGCSE)">Cambridge (IGCSE)</option>
                  <option value="NIOS">NIOS</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Medium of Instruction */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Medium of Instruction
                </label>
                <select
                  value={medium}
                  onChange={(e) => setMedium(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                >
                  <option value="English">English Medium</option>
                  <option value="Hindi">Hindi Medium</option>
                  <option value="Bilingual">Bilingual (English & Hindi)</option>
                  <option value="Other">Other Language</option>
                </select>
              </div>
            </div>

            {/* Subjects Needed */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Subjects Required (comma separated)
              </label>
              <input
                type="text"
                value={subjectsStr}
                onChange={(e) => setSubjectsStr(e.target.value)}
                placeholder="e.g. Mathematics, Physics, Chemistry"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium"
                required
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Popular: Mathematics, Science, Physics, Chemistry, Biology, English, Economics, Accountancy
              </p>
            </div>

            {/* Student Count: 1-on-1 vs Group */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Learning Format
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStudentCount('individual')}
                    className={`py-2 px-3 rounded-xl border font-bold text-xs ${
                      studentCount === 'individual'
                        ? 'bg-teal-50 border-teal-600 text-teal-800 ring-1 ring-teal-500'
                        : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    1-on-1 Individual
                  </button>
                  <button
                    type="button"
                    onClick={() => setStudentCount('group')}
                    className={`py-2 px-3 rounded-xl border font-bold text-xs ${
                      studentCount === 'group'
                        ? 'bg-teal-50 border-teal-600 text-teal-800 ring-1 ring-teal-500'
                        : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    Small Group (2-4)
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Preferred Explanation Language
                </label>
                <select
                  value={preferredLanguage}
                  onChange={(e) => setPreferredLanguage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                >
                  <option value="English & Hindi">English & Hindi (Bilingual)</option>
                  <option value="English Only">English Only</option>
                  <option value="Hindi Only">Hindi Only</option>
                </select>
              </div>
            </div>

            {/* Current Level & Goals */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Current Level & Academic Goals
              </label>
              <textarea
                rows={2}
                value={learningGoals}
                onChange={(e) => setLearningGoals(e.target.value)}
                placeholder="e.g. Student finds geometry challenging. Needs regular practice, revision tests, and doubt-clearing sessions."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
              />
            </div>

            {/* Special Learning Requirements (Optional) */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Special Learning Requirements / Accommodations (Optional)
              </label>
              <input
                type="text"
                value={specialNeeds}
                onChange={(e) => setSpecialNeeds(e.target.value)}
                placeholder="e.g. Extra patience for ADHD/Dyslexia, exam anxiety support, or fast-paced olympiad track"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
              />
            </div>
          </div>
        )}

        {/* STEP 2: Teaching Modes (Multi-select) */}
        {currentStep === 2 && (
          <div className="space-y-5 text-xs">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Step 2: Choose Teaching Modes</h2>
              <p className="text-slate-500 text-[11px]">Select one or more modes that work for your child. Tutors supporting any selected mode will match.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  id: 'student_home',
                  label: "1. Home Tuition",
                  icon: MapPin,
                  badge: 'Direct Supervision',
                  desc: 'Tutor travels to your home in Mayur Vihar, Patparganj or nearby sectors for 1-on-1 focus.'
                },
                {
                  id: 'online',
                  label: '2. Online Tuition',
                  icon: Laptop,
                  badge: 'Interactive Live',
                  desc: 'Remote classes via Zoom/Google Meet with live digital whiteboards and zero travel.'
                },
                {
                  id: 'tutor_centre',
                  label: "3. Tutor's Centre",
                  icon: Building2,
                  badge: 'Academic Environment',
                  desc: 'Student visits tutor’s study centre or classroom in your neighbourhood.'
                }
              ].map((opt) => {
                const isSelected = teachingModes.includes(opt.id);
                return (
                  <div
                    key={opt.id}
                    onClick={() => toggleTeachingMode(opt.id)}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50/70 shadow-md ring-2 ring-teal-500/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSelected ? 'bg-teal-600 text-white shadow-md' : 'bg-slate-100 text-slate-500'}`}>
                          <opt.icon className="w-5 h-5" />
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isSelected ? 'bg-teal-200 text-teal-900' : 'bg-slate-100 text-slate-600'}`}>
                          {opt.badge}
                        </span>
                      </div>
                      <div className="font-bold text-slate-900 text-sm">{opt.label}</div>
                      <p className="text-slate-500 mt-2 leading-relaxed">{opt.desc}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="w-4 h-4 text-teal-600 rounded"
                      />
                      <span className="font-bold text-slate-800">{isSelected ? 'Selected' : 'Click to Select'}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0" />
              <span>
                <strong>Privacy Protected:</strong> For Home and Centre tuition, your exact residential address is never shown publicly. It is disclosed strictly to your confirmed assigned tutor upon confirmed booking.
              </span>
            </div>
          </div>
        )}

        {/* STEP 3: Schedule & Timings */}
        {currentStep === 3 && (
          <div className="space-y-5 text-xs">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Step 3: Schedule, Frequency & Timings</h2>
              <p className="text-slate-500 text-[11px]">Tell us when your child is available for classes.</p>
            </div>

            {/* Tuition Type */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-2">
                Tuition Duration & Purpose
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'regular', label: 'Regular Academic', desc: 'Full-year syllabus' },
                  { id: 'short_term', label: 'Short-Term (1-3 Mo)', desc: 'Targeted topics' },
                  { id: 'crash_course', label: 'Crash Course', desc: 'Exam sprint' },
                  { id: 'one_time', label: 'Doubt Clearing', desc: 'Single session' }
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTuitionType(t.id)}
                    className={`p-3 rounded-xl border text-left font-medium ${
                      tuitionType === t.id
                        ? 'border-teal-600 bg-teal-50 text-teal-900 ring-1 ring-teal-500'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="font-bold text-xs">{t.label}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Sessions per week & Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Sessions Per Week
                </label>
                <select
                  value={classesPerWeek}
                  onChange={(e) => setClassesPerWeek(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                >
                  <option value={2}>2 Classes / Week</option>
                  <option value={3}>3 Classes / Week (Recommended)</option>
                  <option value={4}>4 Classes / Week</option>
                  <option value={5}>5 Classes / Week (Mon-Fri)</option>
                  <option value={6}>6 Classes / Week (Mon-Sat)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Duration Per Class
                </label>
                <select
                  value={durationHours}
                  onChange={(e) => setDurationHours(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                >
                  <option value={1}>1.0 Hour</option>
                  <option value={1.5}>1.5 Hours (Standard)</option>
                  <option value={2}>2.0 Hours (Comprehensive)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Preferred Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                />
              </div>
            </div>

            {/* Preferred Days */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-2">
                Preferred Days of Week
              </label>
              <div className="flex flex-wrap gap-2">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                  const selected = preferredDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => {
                        setPreferredDays((prev) =>
                          selected ? prev.filter((d) => d !== day) : [...prev, day]
                        );
                      }}
                      className={`px-3 py-1.5 rounded-xl border font-semibold ${
                        selected
                          ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Slot Preferences */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Preferred Time Slots
              </label>
              <select
                value={timeRanges[0]}
                onChange={(e) => setTimeRanges([e.target.value])}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
              >
                <option value="Evening (4 PM - 7 PM)">Evening (4 PM - 7 PM) - High Availability</option>
                <option value="Late Evening (7 PM - 9 PM)">Late Evening (7 PM - 9 PM)</option>
                <option value="Afternoon (1 PM - 4 PM)">Afternoon (1 PM - 4 PM)</option>
                <option value="Morning (9 AM - 12 PM)">Morning (9 AM - 12 PM)</option>
                <option value="Weekends Only (Sat-Sun)">Weekends Only (Sat-Sun)</option>
              </select>
            </div>
          </div>
        )}

        {/* STEP 4: Budget */}
        {currentStep === 4 && (
          <div className="space-y-5 text-xs">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Step 4: Budget & Pricing Flexibility</h2>
              <p className="text-slate-500 text-[11px]">Set transparent expectations. No unexpected fees or hidden deductions.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Budget Model
                </label>
                <select
                  value={budgetType}
                  onChange={(e) => setBudgetType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                >
                  <option value="hourly">Hourly Rate (₹ / hour)</option>
                  <option value="monthly">Monthly Package (₹ / month)</option>
                  <option value="per_class">Per Class (₹ / session)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Min Rate (₹ / hr)
                </label>
                <input
                  type="number"
                  value={minBudget}
                  onChange={(e) => setMinBudget(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Max Budget Limit (₹ / hr)
                </label>
                <input
                  type="number"
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Estimated Monthly Budget (Optional, ₹)
              </label>
              <input
                type="number"
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(e.target.value)}
                placeholder="e.g. 6000"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
              />
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-2 font-semibold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFlexible}
                  onChange={(e) => setIsFlexible(e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded"
                />
                <span>Flexible Budget toggle: Open to higher rates for exceptionally qualified/Ph.D. tutors</span>
              </label>

              <label className="flex items-center gap-2 font-semibold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={groupTuitionOk}
                  onChange={(e) => setGroupTuitionOk(e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded"
                />
                <span>Open to small group tuition (2-4 students) for 20-30% reduced fee</span>
              </label>
            </div>
          </div>
        )}

        {/* STEP 5: Location & Preferences */}
        {currentStep === 5 && (
          <div className="space-y-5 text-xs">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Step 5: Locality & Teacher Preferences</h2>
              <p className="text-slate-500 text-[11px]">Specify your area in Delhi NCR for tutor travel compatibility.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Locality (Mayur Vihar & Delhi NCR)
                </label>
                <select
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                >
                  <option value="Mayur Vihar Phase 1">Mayur Vihar Phase 1</option>
                  <option value="Mayur Vihar Phase 2">Mayur Vihar Phase 2</option>
                  <option value="Mayur Vihar Phase 3">Mayur Vihar Phase 3</option>
                  <option value="Patparganj (IP Extension)">Patparganj (IP Extension)</option>
                  <option value="Preet Vihar">Preet Vihar</option>
                  <option value="Laxmi Nagar">Laxmi Nagar</option>
                  <option value="Vasundhara Enclave">Vasundhara Enclave</option>
                  <option value="Pandav Nagar">Pandav Nagar</option>
                  <option value="Nirman Vihar">Nirman Vihar</option>
                  <option value="Anand Vihar">Anand Vihar</option>
                  <option value="East Delhi - Other">East Delhi - Other</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  PIN Code
                </label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Minimum Tutor Experience
                </label>
                <select
                  value={minExperienceYears}
                  onChange={(e) => setMinExperienceYears(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                >
                  <option value={1}>1+ Years Teaching Experience</option>
                  <option value={3}>3+ Years Teaching Experience</option>
                  <option value={5}>5+ Years Teaching Experience</option>
                  <option value={8}>8+ Years Senior Faculty</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Tutor Gender Preference
                </label>
                <select
                  value={genderPreference}
                  onChange={(e) => setGenderPreference(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                >
                  <option value="no_preference">No Preference</option>
                  <option value="female">Female Tutor Preferred</option>
                  <option value="male">Male Tutor Preferred</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Additional Notes / Specific Focus
              </label>
              <textarea
                rows={2}
                value={specificRequirements}
                onChange={(e) => setSpecificRequirements(e.target.value)}
                placeholder="e.g. Needs emphasis on previous 10-year question papers, NCERT exemplar, weekly mock tests..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
              />
            </div>
          </div>
        )}

        {/* STEP 6: Review & Edit Summary */}
        {currentStep === 6 && (
          <div className="space-y-5 text-xs">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Step 6: Review Your Tuition Requirement</h2>
              <p className="text-slate-500 text-[11px]">Confirm all details before submitting. You can click Edit on any section below.</p>
            </div>

            <div className="space-y-3">
              {/* Summary Item 1 */}
              <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200/80 flex items-start justify-between gap-4">
                <div>
                  <div className="font-bold text-teal-950 text-sm">
                    {subjectsStr} Tuition ({classGrade}, {board})
                  </div>
                  <div className="text-slate-600 mt-1 space-y-0.5">
                    <div><strong>Student:</strong> {studentName || 'Student'} ({medium} Medium, {studentCount})</div>
                    <div><strong>Academic Focus:</strong> {learningGoals || 'Regular syllabus clarity'}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-2.5 py-1 rounded-lg bg-white border border-teal-300 text-teal-800 font-bold text-[11px] flex items-center gap-1 hover:bg-teal-100"
                >
                  <Edit3 className="w-3 h-3" /> Edit
                </button>
              </div>

              {/* Summary Item 2 */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="font-bold text-slate-900">Teaching Format & Schedule</div>
                  <div className="text-slate-600">
                    <strong>Modes:</strong> {teachingModes.map((m) => m.replace('_', ' ')).join(', ')}
                  </div>
                  <div className="text-slate-600">
                    <strong>Schedule:</strong> {classesPerWeek} classes/week • {durationHours} hrs/class • {preferredDays.join(', ')} ({timeRanges[0]})
                  </div>
                  <div className="text-slate-600">
                    <strong>Start Date:</strong> {new Date(startDate).toLocaleDateString()}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-slate-700 font-bold text-[11px] flex items-center gap-1 hover:bg-slate-100"
                >
                  <Edit3 className="w-3 h-3" /> Edit
                </button>
              </div>

              {/* Summary Item 3 */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="font-bold text-slate-900">Budget & Locality</div>
                  <div className="text-slate-600">
                    <strong>Rate:</strong> ₹{minBudget} – ₹{maxBudget} / {budgetType} {isFlexible ? '(Budget Flexible)' : ''}
                  </div>
                  <div className="text-slate-600">
                    <strong>Locality:</strong> {locality}, {city} ({pincode})
                  </div>
                  <div className="text-slate-600">
                    <strong>Tutor Experience:</strong> {minExperienceYears}+ Years minimum
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-slate-700 font-bold text-[11px] flex items-center gap-1 hover:bg-slate-100"
                >
                  <Edit3 className="w-3 h-3" /> Edit
                </button>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Matching tutors in {locality} will be notified immediately upon submission.</span>
            </div>
          </div>
        )}

        {/* Navigation Step Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="px-5 py-2.5 rounded-xl btn-3d-secondary text-xs font-bold flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 6 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl btn-3d-primary text-xs uppercase tracking-wider font-bold flex items-center gap-1.5"
            >
              <span>Continue to Step {currentStep + 1}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmit}
              className="px-8 py-3 rounded-xl btn-3d-navy text-xs uppercase tracking-wider font-bold flex items-center gap-2 disabled:opacity-50 shadow-lg"
            >
              <span>{submitting ? 'Submitting Requirement...' : 'Confirm & Find Matching Tutors'}</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
