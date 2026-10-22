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
  AlertCircle
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
  // Step 1: Student
  const [childId, setChildId] = useState('');
  const [classGrade, setClassGrade] = useState('Class 10');
  const [board, setBoard] = useState('CBSE');
  const [subjectsStr, setSubjectsStr] = useState('Mathematics');
  const [preferredLanguage, setPreferredLanguage] = useState('English & Hindi');
  const [learningGoals, setLearningGoals] = useState('');

  // Step 2: Teaching Arrangement
  const [teachingMode, setTeachingMode] = useState('student_home');

  // Step 3: Schedule
  const [preferredDays, setPreferredDays] = useState(['Monday', 'Wednesday', 'Friday']);
  const [timeRanges, setTimeRanges] = useState(['Evening (4 PM - 7 PM)']);
  const [classesPerWeek, setClassesPerWeek] = useState(3);
  const [durationHours, setDurationHours] = useState(1.5);

  // Step 4: Budget
  const [minBudget, setMinBudget] = useState(500);
  const [maxBudget, setMaxBudget] = useState(800);
  const [budgetType, setBudgetType] = useState('hourly');
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
            setClassGrade(res.children[0].classGrade);
            setBoard(res.children[0].board);
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

  const handleNext = () => {
    if (currentStep === 1) {
      if (!childId) {
        showToast('Please select a child profile.', 'error');
        return;
      }
      if (!subjectsStr.trim()) {
        showToast('Please specify at least one subject.', 'error');
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
      const payload = {
        childId,
        classGrade,
        board,
        subjects,
        preferredLanguage,
        learningGoals,
        teachingMode,
        schedule: {
          preferredDays,
          timeRanges,
          classesPerWeek: Number(classesPerWeek),
          durationHours: Number(durationHours)
        },
        budget: {
          minBudget: Number(minBudget),
          maxBudget: Number(maxBudget),
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
        showToast('Tuition requirement posted successfully! Matching tutors notified.', 'success');
        navigate(`/parent/requirements`);
      }
    } catch (err) {
      showToast(err.message || 'Failed to submit requirement', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900">Post a Tuition Requirement</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Step {currentStep} of 6 — Complete the guided wizard to get matched with suitable verified tutors
        </p>
      </div>

      {/* Step Indicators */}
      <div className="grid grid-cols-6 gap-2">
        {['Student', 'Mode', 'Schedule', 'Budget', 'Preferences', 'Review'].map((stepName, idx) => (
          <div
            key={idx}
            className={`text-center py-2 rounded-xl text-[11px] font-bold transition-all ${
              currentStep === idx + 1
                ? 'bg-teal-600 text-white shadow-xs'
                : currentStep > idx + 1
                ? 'bg-teal-100 text-teal-800'
                : 'bg-slate-200/70 text-slate-500'
            }`}
          >
            {stepName}
          </div>
        ))}
      </div>

      {/* Step Form Box */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
        {/* STEP 1: Student Details */}
        {currentStep === 1 && (
          <div className="space-y-4 text-xs">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              Step 1: Student Information
            </h2>

            {children.length === 0 ? (
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-2">
                <p className="font-bold text-amber-900">No child profile found!</p>
                <p className="text-amber-800 leading-relaxed">
                  Please add a child profile first before posting a requirement.
                </p>
                <Link
                  to="/parent/children"
                  className="inline-block px-4 py-2 bg-slate-900 text-white font-bold rounded-xl"
                >
                  Create Child Profile
                </Link>
              </div>
            ) : (
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Select Child
                </label>
                <select
                  value={childId}
                  onChange={(e) => {
                    setChildId(e.target.value);
                    const selected = children.find((c) => c._id === e.target.value);
                    if (selected) {
                      setClassGrade(selected.classGrade);
                      setBoard(selected.board);
                      if (selected.subjects?.length > 0) {
                        setSubjectsStr(selected.subjects.join(', '));
                      }
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium"
                >
                  {children.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.displayName || c.fullName} ({c.classGrade}, {c.board})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Class / Grade
                </label>
                <select
                  value={classGrade}
                  onChange={(e) => setClassGrade(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                >
                  {[
                    'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
                    'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
                    'Class 11', 'Class 12', 'Competitive: JEE', 'Competitive: NEET', 'Competitive: CUET'
                  ].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Board
                </label>
                <select
                  value={board}
                  onChange={(e) => setBoard(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                >
                  <option value="CBSE">CBSE</option>
                  <option value="ICSE">ICSE</option>
                  <option value="State Board">State Board</option>
                  <option value="NIOS">NIOS</option>
                  <option value="IB">IB</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Subjects Needed (comma separated)
              </label>
              <input
                type="text"
                value={subjectsStr}
                onChange={(e) => setSubjectsStr(e.target.value)}
                placeholder="e.g. Mathematics, Science"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Preferred Teaching Language
              </label>
              <select
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300"
              >
                <option value="English & Hindi">English & Hindi (Bilingual)</option>
                <option value="English Only">English Only</option>
                <option value="Hindi Only">Hindi Only</option>
              </select>
            </div>
          </div>
        )}

        {/* STEP 2: Teaching Arrangement */}
        {currentStep === 2 && (
          <div className="space-y-4 text-xs">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              Step 2: Choose Teaching Arrangement
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  id: 'student_home',
                  label: "At Student's Home",
                  icon: MapPin,
                  desc: 'Tutor travels to your home in Mayur Vihar/East Delhi for 1-on-1 focus.'
                },
                {
                  id: 'online',
                  label: 'Online Tuition',
                  icon: Laptop,
                  desc: 'Interactive live video classes from anywhere with whiteboard.'
                },
                {
                  id: 'tutor_centre',
                  label: "At Tutor's Centre",
                  icon: Building2,
                  desc: 'Student visits tutor’s neighbourhood academic classroom or batch.'
                }
              ].map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => setTeachingMode(opt.id)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                    teachingMode === opt.id
                      ? 'border-teal-600 bg-teal-50/70 shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <opt.icon className={`w-6 h-6 mb-2 ${teachingMode === opt.id ? 'text-teal-700' : 'text-slate-400'}`} />
                  <div className="font-bold text-slate-900 text-sm">{opt.label}</div>
                  <p className="text-slate-500 mt-1 leading-relaxed">{opt.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: Schedule */}
        {currentStep === 3 && (
          <div className="space-y-4 text-xs">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              Step 3: Schedule & Timings
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Classes Per Week
                </label>
                <select
                  value={classesPerWeek}
                  onChange={(e) => setClassesPerWeek(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                >
                  <option value={2}>2 Classes / Week</option>
                  <option value={3}>3 Classes / Week (Recommended)</option>
                  <option value={4}>4 Classes / Week</option>
                  <option value={5}>5 Classes / Week (Mon-Fri)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Duration Per Class
                </label>
                <select
                  value={durationHours}
                  onChange={(e) => setDurationHours(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                >
                  <option value={1}>1.0 Hour</option>
                  <option value={1.5}>1.5 Hours</option>
                  <option value={2}>2.0 Hours</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-2">
                Preferred Days
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
                          ? 'bg-teal-600 text-white border-teal-600'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Preferred Time Slot
              </label>
              <select
                value={timeRanges[0]}
                onChange={(e) => setTimeRanges([e.target.value])}
                className="w-full px-3 py-2 rounded-xl border border-slate-300"
              >
                <option value="Evening (4 PM - 7 PM)">Evening (4 PM - 7 PM)</option>
                <option value="Late Evening (7 PM - 9 PM)">Late Evening (7 PM - 9 PM)</option>
                <option value="Afternoon (1 PM - 4 PM)">Afternoon (1 PM - 4 PM)</option>
                <option value="Morning (9 AM - 12 PM)">Morning (9 AM - 12 PM)</option>
                <option value="Weekends Only">Weekends Only</option>
              </select>
            </div>
          </div>
        )}

        {/* STEP 4: Budget */}
        {currentStep === 4 && (
          <div className="space-y-4 text-xs">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              Step 4: Budget & Rate Expectation
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Budget Model
                </label>
                <select
                  value={budgetType}
                  onChange={(e) => setBudgetType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                >
                  <option value="hourly">Hourly Rate (₹ / hour)</option>
                  <option value="monthly">Monthly Rate (₹ / month)</option>
                  <option value="per_class">Per Class Rate (₹ / session)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Max Budget Limit (₹)
                </label>
                <input
                  type="number"
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 font-semibold text-slate-800 cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={groupTuitionOk}
                onChange={(e) => setGroupTuitionOk(e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded"
              />
              <span>Open to small group tuition (2-4 students) for reduced per-student rates</span>
            </label>
          </div>
        )}

        {/* STEP 5: Location & Preferences */}
        {currentStep === 5 && (
          <div className="space-y-4 text-xs">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              Step 5: Locality & Teacher Preferences
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Locality (Mayur Vihar / East Delhi)
                </label>
                <select
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                >
                  <option value="Mayur Vihar Phase 1">Mayur Vihar Phase 1</option>
                  <option value="Mayur Vihar Phase 2">Mayur Vihar Phase 2</option>
                  <option value="Mayur Vihar Phase 3">Mayur Vihar Phase 3</option>
                  <option value="Patparganj (IP Extension)">Patparganj (IP Extension)</option>
                  <option value="Preet Vihar">Preet Vihar</option>
                  <option value="Laxmi Nagar">Laxmi Nagar</option>
                  <option value="Vasundhara Enclave">Vasundhara Enclave</option>
                  <option value="Pandav Nagar">Pandav Nagar</option>
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
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Min Tutor Experience
                </label>
                <select
                  value={minExperienceYears}
                  onChange={(e) => setMinExperienceYears(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                >
                  <option value={1}>1+ Years</option>
                  <option value={3}>3+ Years</option>
                  <option value={5}>5+ Years</option>
                  <option value={8}>8+ Years</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Tutor Gender Preference
                </label>
                <select
                  value={genderPreference}
                  onChange={(e) => setGenderPreference(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                >
                  <option value="no_preference">No Preference</option>
                  <option value="female">Female Tutor Preferred</option>
                  <option value="male">Male Tutor Preferred</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Specific Learning Focus / Additional Notes
              </label>
              <textarea
                rows={2}
                value={specificRequirements}
                onChange={(e) => setSpecificRequirements(e.target.value)}
                placeholder="e.g. Focus on NCERT exemplar problems, previous 10-year question papers, weekly tests..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300"
              />
            </div>
          </div>
        )}

        {/* STEP 6: Review & Submit */}
        {currentStep === 6 && (
          <div className="space-y-4 text-xs">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              Step 6: Review Your Tuition Requirement
            </h2>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="font-bold text-slate-900 text-sm">
                {subjectsStr} Tuition ({classGrade}, {board})
              </div>
              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <div><strong>Teaching Mode:</strong> <span className="capitalize">{teachingMode.replace('_', ' ')}</span></div>
                <div><strong>Schedule:</strong> {classesPerWeek} classes/wk ({durationHours} hrs/class)</div>
                <div><strong>Preferred Days:</strong> {preferredDays.join(', ')}</div>
                <div><strong>Budget:</strong> Up to ₹{maxBudget} / {budgetType}</div>
                <div><strong>Locality:</strong> {locality}, {city} ({pincode})</div>
                <div><strong>Experience Req:</strong> {minExperienceYears}+ Years</div>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Once submitted, our matching algorithm will evaluate active verified tutors in your area and notify top candidates.
            </p>
          </div>
        )}

        {/* Navigation Step Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>
          ) : (
            <div></div>
          )}

          {currentStep < 6 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmit}
              className="px-7 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 shadow-md disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Post Tuition Requirement'}
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
