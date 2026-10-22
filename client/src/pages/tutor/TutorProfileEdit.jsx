import React, { useState, useEffect } from 'react';
import { Save, Laptop, MapPin, Building2, CheckCircle2, DollarSign } from 'lucide-react';
import { apiRequest } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const TutorProfileEdit = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [teachingMethodology, setTeachingMethodology] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState(2);
  const [previousExperience, setPreviousExperience] = useState('');
  const [languagesStr, setLanguagesStr] = useState('English, Hindi');
  const [subjectsStr, setSubjectsStr] = useState('Mathematics, Physics');
  const [classesStr, setClassesStr] = useState('Class 9, Class 10, Class 11, Class 12');

  // Teaching Modes
  const [teachingModes, setTeachingModes] = useState(['online']);

  // Home Tuition
  const [preferredLocalitiesStr, setPreferredLocalitiesStr] = useState('Mayur Vihar Phase 1, Mayur Vihar Phase 2');
  const [maxTravelDistanceKm, setMaxTravelDistanceKm] = useState(5);

  // Centre Details
  const [centreName, setCentreName] = useState('');
  const [centreLocality, setCentreLocality] = useState('Mayur Vihar Phase 1');
  const [facilitiesStr, setFacilitiesStr] = useState('Air Conditioned, Whiteboard');

  // Fee Structure
  const [hourlyRate, setHourlyRate] = useState(600);
  const [monthlyRate, setMonthlyRate] = useState(4800);
  const [demoClassAvailable, setDemoClassAvailable] = useState(true);
  const [demoClassFee, setDemoClassFee] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiRequest('/tutors/profile/me');
        if (res.success && res.profile) {
          const p = res.profile;
          setHeadline(p.headline || '');
          setBio(p.bio || '');
          setTeachingMethodology(p.teachingMethodology || '');
          setYearsOfExperience(p.yearsOfExperience || 2);
          setPreviousExperience(p.previousExperience || '');
          setLanguagesStr(p.teachingLanguages?.join(', ') || 'English, Hindi');
          setSubjectsStr(p.subjects?.join(', ') || '');
          setClassesStr(p.classes?.join(', ') || '');
          setTeachingModes(p.teachingModes || ['online']);
          setPreferredLocalitiesStr(p.homeTuitionDetails?.preferredLocalities?.join(', ') || '');
          setMaxTravelDistanceKm(p.homeTuitionDetails?.maxTravelDistanceKm || 5);
          setCentreName(p.centreDetails?.centreName || '');
          setCentreLocality(p.centreDetails?.locality || 'Mayur Vihar Phase 1');
          setFacilitiesStr(p.centreDetails?.facilities?.join(', ') || '');
          setHourlyRate(p.feeStructure?.hourlyRate || 500);
          setMonthlyRate(p.feeStructure?.monthlyRate || 4000);
          setDemoClassAvailable(p.demoClassAvailable ?? true);
          setDemoClassFee(p.demoClassFee || 0);
        }
      } catch (err) {
        showToast('Failed to load profile', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [showToast]);

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
    const teachingLanguages = languagesStr.split(',').map((s) => s.trim()).filter(Boolean);
    const preferredLocalities = preferredLocalitiesStr.split(',').map((s) => s.trim()).filter(Boolean);
    const facilities = facilitiesStr.split(',').map((s) => s.trim()).filter(Boolean);

    try {
      const payload = {
        headline,
        bio,
        teachingMethodology,
        yearsOfExperience: Number(yearsOfExperience),
        previousExperience,
        teachingLanguages,
        subjects,
        classes,
        teachingModes,
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
          monthlyRate: Number(monthlyRate)
        },
        demoClassAvailable,
        demoClassFee: Number(demoClassFee)
      };

      const res = await apiRequest('/tutors/profile/me', {
        method: 'PUT',
        body: JSON.stringify(payload)
      });

      if (res.success) {
        showToast('Profile and fee settings saved successfully!', 'success');
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Profile & Rate Settings</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure your teaching headline, supported subjects, modes, and fee structure
          </p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm flex items-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* 1. Basic Info */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 text-xs">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
          Headline & Biography
        </h2>

        <div>
          <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
            Professional Headline
          </label>
          <input
            type="text"
            required
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="e.g. M.Sc. Mathematics | 8+ Years CBSE & Board Specialist"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
            Detailed Bio & Teaching Experience
          </label>
          <textarea
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Describe your educational background, mentoring experience, and dedication to students..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
            Teaching Methodology & Pedagogy
          </label>
          <textarea
            rows={2}
            value={teachingMethodology}
            onChange={(e) => setTeachingMethodology(e.target.value)}
            placeholder="e.g. Concept-clarity first with regular practice tests, customized pace, and doubt clearing sessions..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Years of Experience
            </label>
            <input
              type="number"
              min={0}
              value={yearsOfExperience}
              onChange={(e) => setYearsOfExperience(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Languages Taught In
            </label>
            <input
              type="text"
              value={languagesStr}
              onChange={(e) => setLanguagesStr(e.target.value)}
              placeholder="e.g. English, Hindi"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium"
            />
          </div>
        </div>
      </div>

      {/* 2. Subjects & Classes */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 text-xs">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
          Subjects & Classes Supported
        </h2>

        <div>
          <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
            Subjects Taught (comma separated)
          </label>
          <input
            type="text"
            required
            value={subjectsStr}
            onChange={(e) => setSubjectsStr(e.target.value)}
            placeholder="e.g. Mathematics, Physics, Chemistry"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
            Classes / Learning Levels (comma separated)
          </label>
          <input
            type="text"
            required
            value={classesStr}
            onChange={(e) => setClassesStr(e.target.value)}
            placeholder="e.g. Class 9, Class 10, Class 11, Class 12, Competitive: JEE"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium"
          />
        </div>
      </div>

      {/* 3. Teaching Modes Supported */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 text-xs">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
          Teaching Modes Supported (Select 1, 2, or all 3)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: 'online', label: 'Online Tuition', icon: Laptop },
            { id: 'student_home', label: "Student's Home", icon: MapPin },
            { id: 'tutor_centre', label: "Tutor's Centre", icon: Building2 }
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
                  placeholder="e.g. Mayur Vihar Phase 1, Patparganj, Preet Vihar"
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
                <label className="block text-slate-700 font-semibold mb-1">
                  Centre Name
                </label>
                <input
                  type="text"
                  value={centreName}
                  onChange={(e) => setCentreName(e.target.value)}
                  placeholder="e.g. Apex Science Study Centre"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Centre Locality
                </label>
                <input
                  type="text"
                  value={centreLocality}
                  onChange={(e) => setCentreLocality(e.target.value)}
                  placeholder="e.g. Mayur Vihar Phase 2"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Fee Structure */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 text-xs">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
          Fee Structure & Trial Class
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              Monthly Rate Package (₹ / month)
            </label>
            <input
              type="number"
              min={500}
              value={monthlyRate}
              onChange={(e) => setMonthlyRate(e.target.value)}
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
                Free Trial (Recommended)
              </button>
            </div>
          )}
        </div>
      </div>
    </form>
  );
};
