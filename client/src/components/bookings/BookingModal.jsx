import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Laptop,
  Building2,
  ShieldCheck,
  AlertCircle,
  Plus,
  Check,
  User,
  GraduationCap,
  CreditCard,
  Ban,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { apiRequest } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { PaymentModal } from '../common/PaymentModal';

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const BookingModal = ({ tutor, onClose, onBookingSuccess }) => {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [parentProfile, setParentProfile] = useState(null);
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [bookingType, setBookingType] = useState('demo'); // 'demo' | 'regular'

  // Teaching Mode (Restricted to tutor's supported modes)
  const defaultMode = tutor?.teachingModes?.[0] || 'online';
  const [teachingMode, setTeachingMode] = useState(defaultMode);

  // Subject & Class
  const [subject, setSubject] = useState(tutor?.subjects?.[0] || 'Mathematics');
  const [classGrade, setClassGrade] = useState(tutor?.classes?.[0] || 'Class 10');

  // Schedule & Days
  const [preferredDays, setPreferredDays] = useState(['Mon', 'Wed', 'Fri']);
  const [sessionDate, setSessionDate] = useState('');
  const [startTime, setStartTime] = useState('17:00');
  const [endTime, setEndTime] = useState('18:00');

  // Address for Student's Home
  const [studentExactAddress, setStudentExactAddress] = useState('');

  // Special Instructions
  const [notes, setNotes] = useState('');

  // Inline Quick Add Child Form State
  const [showQuickAddChild, setShowQuickAddChild] = useState(false);
  const [quickChildName, setQuickChildName] = useState('');
  const [quickChildClass, setQuickChildClass] = useState('Class 10');
  const [quickChildBoard, setQuickChildBoard] = useState('CBSE');
  const [quickChildMedium, setQuickChildMedium] = useState('English');
  const [quickChildSchool, setQuickChildSchool] = useState('');
  const [addingChild, setAddingChild] = useState(false);

  // Submission & Flow
  const [loading, setLoading] = useState(false);
  const [fetchingParentData, setFetchingParentData] = useState(true);
  const [createdBookingForPayment, setCreatedBookingForPayment] = useState(null);

  // Set minimum date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateStr = tomorrow.toISOString().split('T')[0];

  useEffect(() => {
    if (!sessionDate) {
      setSessionDate(minDateStr);
    }
  }, [minDateStr, sessionDate]);

  // Fetch Parent Profile & Saved Children
  useEffect(() => {
    const fetchParentDetails = async () => {
      if (!isAuthenticated || user?.role !== 'parent') {
        setFetchingParentData(false);
        return;
      }
      try {
        const res = await apiRequest('/parents/profile');
        if (res.success) {
          if (res.profile) {
            setParentProfile(res.profile);
            if (res.profile.address) {
              setStudentExactAddress(res.profile.address);
            }
          }
          if (res.children && res.children.length > 0) {
            setChildren(res.children);
            // Preselect first/only child automatically
            setSelectedChildId(res.children[0]._id);
            if (res.children[0].classGrade) {
              setClassGrade(res.children[0].classGrade);
            }
          } else {
            // No child saved -> open quick add child form automatically
            setShowQuickAddChild(true);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setFetchingParentData(false);
      }
    };
    fetchParentDetails();
  }, [isAuthenticated, user]);

  // Handle child selection change
  const handleChildSelect = (childId) => {
    setSelectedChildId(childId);
    const selected = children.find((c) => c._id === childId);
    if (selected?.classGrade) {
      setClassGrade(selected.classGrade);
    }
  };

  // Quick Add Child handler (without leaving the booking form)
  const handleQuickAddChild = async (e) => {
    e.preventDefault();
    if (!quickChildName.trim()) {
      showToast('Student full name is required.', 'error');
      return;
    }

    setAddingChild(true);
    try {
      const res = await apiRequest('/parents/children', {
        method: 'POST',
        body: JSON.stringify({
          fullName: quickChildName.trim(),
          classGrade: quickChildClass,
          board: quickChildBoard,
          medium: quickChildMedium,
          school: quickChildSchool.trim()
        })
      });

      if (res.success && res.child) {
        showToast('Student added and selected!', 'success');
        setChildren((prev) => [res.child, ...prev]);
        setSelectedChildId(res.child._id);
        setClassGrade(res.child.classGrade);
        setShowQuickAddChild(false);
        setQuickChildName('');
      }
    } catch (err) {
      showToast(err.message || 'Failed to add student', 'error');
    } finally {
      setAddingChild(false);
    }
  };

  // Toggle preferred day pills
  const toggleDay = (day) => {
    setPreferredDays((prev) =>
      prev.includes(day)
        ? prev.length > 1
          ? prev.filter((d) => d !== day)
          : prev
        : [...prev, day]
    );
  };

  // Price Calculation
  const isFreeDemo = bookingType === 'demo' && tutor?.demoClassFee === 0;
  const tutorFee = isFreeDemo
    ? 0
    : bookingType === 'demo'
    ? tutor?.demoClassFee || 199
    : tutor?.feeStructure?.hourlyRate || 500;
  const platformFee = isFreeDemo ? 0 : 50;
  const totalAmount = isFreeDemo ? 0 : tutorFee + platformFee;

  const selectedChild = children.find((c) => c._id === selectedChildId);

  // Submit Booking
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedChildId) {
      showToast('Please select or add a student first.', 'error');
      return;
    }

    if (!sessionDate || !startTime || !endTime) {
      showToast('Please select session date and time slot.', 'error');
      return;
    }

    if (startTime >= endTime) {
      showToast('End time must be later than start time.', 'error');
      return;
    }

    if (teachingMode === 'student_home' && !studentExactAddress.trim()) {
      showToast("Please provide the home address for Student's Home tuition.", 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        tutorProfileId: tutor._id,
        childId: selectedChildId,
        teachingMode,
        bookingType,
        subject,
        classGrade,
        sessionDate,
        startTime,
        endTime,
        preferredDays,
        studentExactAddress: teachingMode === 'student_home' ? studentExactAddress : '',
        notes
      };

      const res = await apiRequest('/bookings', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (res.success) {
        if (bookingType === 'regular' || (bookingType === 'demo' && !isFreeDemo)) {
          showToast('Booking initiated! Complete checkout to confirm.', 'info');
          setCreatedBookingForPayment(res.booking);
        } else {
          showToast('Trial class request sent successfully! Tutor will respond shortly.', 'success');
          if (onBookingSuccess) onBookingSuccess(res.booking);
          onClose();
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to submit booking request', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (createdBookingForPayment) {
    return (
      <PaymentModal
        booking={createdBookingForPayment}
        onClose={onClose}
        onPaymentSuccess={(confirmedBooking) => {
          if (onBookingSuccess) onBookingSuccess(confirmedBooking);
          onClose();
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-200/90 max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto text-left">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div>
            <span className="text-xs font-black text-teal-700 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              {bookingType === 'demo' ? 'Book Trial Session' : 'Direct Tuition Booking'}
            </span>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-0.5">
              Book with {tutor?.user?.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs">
          {/* 1. Session Type Selector */}
          <div>
            <label className="block text-slate-700 font-bold uppercase tracking-wider text-[11px] mb-1.5">
              Select Session Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setBookingType('demo')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                  bookingType === 'demo'
                    ? 'bg-teal-50 border-teal-500 text-teal-900 shadow-xs ring-2 ring-teal-500/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Trial / Demo Class {tutor?.demoClassFee === 0 ? '(Free)' : `(₹${tutor?.demoClassFee})`}
              </button>
              <button
                type="button"
                onClick={() => setBookingType('regular')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                  bookingType === 'regular'
                    ? 'bg-teal-50 border-teal-500 text-teal-900 shadow-xs ring-2 ring-teal-500/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Regular Tuition (₹{tutor?.feeStructure?.hourlyRate || 500}/hr)
              </button>
            </div>
          </div>

          {/* 2. Select Child (with Quick Add option) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                1. Select Student <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setShowQuickAddChild(!showQuickAddChild)}
                className="text-[11px] font-bold text-teal-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showQuickAddChild ? 'Cancel Quick Add' : 'Add Another Student'}</span>
              </button>
            </div>

            {/* Quick Add Child Inline Drawer */}
            {showQuickAddChild && (
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-teal-200/80 space-y-3 animate-in fade-in duration-150">
                <div className="font-bold text-slate-900 text-xs">Quick Add Student Profile</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    required
                    placeholder="Student Full Name *"
                    value={quickChildName}
                    onChange={(e) => setQuickChildName(e.target.value)}
                    className="px-3 py-2 rounded-xl input-3d text-xs font-medium"
                  />
                  <select
                    value={quickChildClass}
                    onChange={(e) => setQuickChildClass(e.target.value)}
                    className="px-3 py-2 rounded-xl input-3d text-xs font-medium"
                  >
                    {[
                      'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
                      'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
                      'Class 11', 'Class 12', 'College'
                    ].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <select
                    value={quickChildBoard}
                    onChange={(e) => setQuickChildBoard(e.target.value)}
                    className="px-3 py-2 rounded-xl input-3d text-xs font-medium"
                  >
                    {['CBSE', 'ICSE', 'State Board', 'IB / Cambridge', 'Other'].map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                  <select
                    value={quickChildMedium}
                    onChange={(e) => setQuickChildMedium(e.target.value)}
                    className="px-3 py-2 rounded-xl input-3d text-xs font-medium"
                  >
                    {['English', 'Hindi', 'Other (Bilingual)'].map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={handleQuickAddChild}
                  disabled={addingChild || !quickChildName.trim()}
                  className="w-full py-2 rounded-xl btn-3d-primary text-xs font-bold disabled:opacity-50"
                >
                  {addingChild ? 'Saving Student...' : 'Save & Select Student'}
                </button>
              </div>
            )}

            {children.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {children.map((child) => {
                  const isSelected = selectedChildId === child._id;
                  return (
                    <button
                      key={child._id}
                      type="button"
                      onClick={() => handleChildSelect(child._id)}
                      className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'border-teal-500 bg-teal-50/70 shadow-xs ring-2 ring-teal-500/20'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-slate-900">{child.fullName}</div>
                        <div className="text-[11px] text-slate-500">
                          {child.classGrade} • {child.board}
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Please fill the quick student form above to proceed.</span>
              </div>
            )}
          </div>

          {/* 3. Subject & Teaching Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold uppercase tracking-wider text-[11px] mb-1">
                2. Subject Needed <span className="text-rose-500">*</span>
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl input-3d text-xs font-semibold"
                required
              >
                {tutor?.subjects?.map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold uppercase tracking-wider text-[11px] mb-1">
                3. Teaching Mode <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'student_home', label: 'Home', icon: MapPin },
                  { id: 'online', label: 'Online', icon: Laptop },
                  { id: 'tutor_centre', label: 'Centre', icon: Building2 }
                ].map(({ id, label, icon: Icon }) => {
                  const isSupported = tutor?.teachingModes?.includes(id);
                  return (
                    <button
                      key={id}
                      type="button"
                      disabled={!isSupported}
                      onClick={() => setTeachingMode(id)}
                      className={`py-2 px-1 rounded-xl border text-[11px] font-bold flex flex-col items-center gap-1 transition-all ${
                        teachingMode === id
                          ? 'border-teal-600 bg-teal-50 text-teal-900 ring-2 ring-teal-500/20'
                          : isSupported
                          ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 cursor-pointer'
                          : 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Mode Context Notes */}
          {teachingMode === 'student_home' && (
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between text-slate-700 font-bold text-[11px]">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-teal-600" />
                  <span>Student's Home Address (Auto-populated from account)</span>
                </span>
                <span className="text-teal-700 text-[10px]">Private & Protected</span>
              </div>
              <input
                type="text"
                required
                value={studentExactAddress}
                onChange={(e) => setStudentExactAddress(e.target.value)}
                placeholder="House/Flat No., Pocket, Locality (e.g. Pocket 1, Mayur Vihar)"
                className="w-full px-3 py-2 rounded-xl input-3d text-xs font-medium"
              />
              <p className="text-[10px] text-slate-400 leading-tight">
                Privacy guarantee: Your exact home address is revealed to the tutor only after booking confirmation.
              </p>
            </div>
          )}

          {teachingMode === 'online' && (
            <div className="p-3 bg-sky-50/70 rounded-2xl border border-sky-200/80 flex items-center gap-2.5 text-sky-900">
              <Laptop className="w-4 h-4 text-sky-600 shrink-0" />
              <div className="text-[11px] leading-tight">
                <span className="font-bold">Online Live Classroom:</span> No home address required. Live Google Meet / Zoom class link will be delivered directly to your dashboard.
              </div>
            </div>
          )}

          {teachingMode === 'tutor_centre' && (
            <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 flex items-center gap-2.5 text-emerald-950">
              <Building2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <div className="text-[11px] leading-tight">
                <span className="font-bold">Tutor's Teaching Centre:</span> Located at{' '}
                <span className="font-bold underline">
                  {tutor?.centreDetails?.centreName || tutor?.centreDetails?.locality || tutor?.primaryLocality || 'Teaching Centre'}
                </span>
                . Student home address is not required.
              </div>
            </div>
          )}

          {/* 4. Preferred Days & Schedule */}
          <div className="space-y-2">
            <label className="block text-slate-700 font-bold uppercase tracking-wider text-[11px]">
              4. Preferred Days & Schedule
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {DAYS_OF_WEEK.map((day) => {
                const isSelected = preferredDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Starting Date</label>
                <input
                  type="date"
                  min={minDateStr}
                  required
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl input-3d text-xs font-medium"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Start Time</label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl input-3d text-xs font-medium"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">End Time</label>
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl input-3d text-xs font-medium"
                />
              </div>
            </div>
          </div>

          {/* 5. Special Instructions (Optional) */}
          <div>
            <label className="block text-slate-700 font-bold uppercase tracking-wider text-[11px] mb-1">
              5. Special Learning Instructions (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Focus on upcoming midterm syllabus, conceptual mathematics problem solving..."
              className="w-full px-3.5 py-2 rounded-xl input-3d text-xs font-medium"
            />
          </div>

          {/* 6. BOOKING SUMMARY & PAYMENT PREVIEW */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3 shadow-md">
            <div className="text-[11px] font-bold uppercase tracking-wider text-teal-400 flex items-center justify-between">
              <span>Booking Summary</span>
              <span>Protected Escrow</span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-300 divide-y divide-slate-800">
              <div className="flex justify-between pt-1">
                <span>Parent Name:</span>
                <span className="font-bold text-white">{parentProfile?.fullName || user?.name || 'Parent'}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span>Selected Student:</span>
                <span className="font-bold text-white">{selectedChild?.fullName || 'Not selected'} ({selectedChild?.classGrade || classGrade})</span>
              </div>
              <div className="flex justify-between pt-1">
                <span>Tutor:</span>
                <span className="font-bold text-teal-300">{tutor?.user?.name}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span>Subject & Mode:</span>
                <span className="font-bold text-white capitalize">{subject} • {teachingMode.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span>Schedule:</span>
                <span className="font-bold text-white">{sessionDate} ({preferredDays.join(', ')}) at {startTime}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span>Tutor Fee:</span>
                <span className="font-bold text-white">
                  {isFreeDemo ? 'Free' : `₹${tutorFee}`}
                </span>
              </div>
              {!isFreeDemo && (
                <div className="flex justify-between pt-1">
                  <span>Platform Fee:</span>
                  <span className="font-bold text-slate-300">₹{platformFee}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 text-sm">
                <span className="font-extrabold text-white">Total Payable:</span>
                <span className="font-black text-lg text-emerald-400">
                  {isFreeDemo ? '₹0 (Free Trial)' : `₹${totalAmount}`}
                </span>
              </div>
            </div>

            {/* Payment Method Badges */}
            <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 rounded-xl bg-teal-950/80 border border-teal-500/40 text-teal-200 flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>Online Escrow (Enabled)</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700 text-slate-400 flex items-center gap-1.5 font-medium opacity-60 cursor-not-allowed" title="Direct cash payments disabled by platform policy for safety">
                <Ban className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>Cash Payment (Disabled)</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="w-1/3 py-2.5 rounded-xl btn-3d-secondary text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedChildId}
              className="w-2/3 py-2.5 rounded-xl btn-3d-primary text-xs font-bold disabled:opacity-50"
            >
              {loading ? 'Processing...' : isFreeDemo ? 'Confirm Free Trial' : 'Proceed to Checkout'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
